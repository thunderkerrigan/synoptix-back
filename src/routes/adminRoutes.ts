import { Request, Response, Router } from "express";
import { DateTime } from "luxon";
import { findNewMovie } from "../controllers/SynoptixController";
import { TypedRequestBody } from "../models/Express";
import { Game } from "../models/Game";
import { GameModel } from "../models/mongo/Game/Game.model";
import { expressjwt } from "express-jwt";
const router = Router();

let currentGame: Game;

// game

const getGame = async () => {
  const todayISODate = DateTime.now();
  if (currentGame && currentGame.date === todayISODate.toISODate()) {
    return currentGame;
  }
  const existingGame = await GameModel.findByDate(todayISODate);
  if (existingGame) {
    currentGame = new Game(existingGame);
    return currentGame;
  }
};

router.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  })
);

router.get("/response", async (req: Request, res: Response) => {
  try {
    const game = await getGame();
    res.send(game.title + game.solutionPlainText);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/random", async (req: Request, res: Response) => {
  try {
    const game = await GameModel.findARandomOne();
    res.send(game);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/movie/:movie", async (req: Request, res: Response) => {
  try {
    const { movie } = req.params;
    const {
      id: _id,
      title,
      synopsis,
      untreatedSynopsis,
    } = await findNewMovie(movie);

    return res.send({ id: _id, title, synopsis, untreatedSynopsis });
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error);
  }
});

router.post(
  "/movie",
  async (
    req: TypedRequestBody<{
      id: number;
      title: string;
      synopsis: string;
    }>,
    res: Response
  ) => {
    try {
      const { id: _id, title, synopsis } = req.body;
      const existingGame = await GameModel.findById(_id);
      let game: Game;
      if (existingGame) {
        console.log("existingGame", existingGame);
        game = new Game(existingGame);
      } else {
        console.log("not existing");
        game = new Game({ _id, title, solutionPlainText: synopsis });
        console.log("game", game);
        await GameModel.create(game.gameModel);
      }
      return res.send(game);
    } catch (error) {
      console.log("error", error);
      res.status(500).send(error);
    }
  }
);

export default router;
