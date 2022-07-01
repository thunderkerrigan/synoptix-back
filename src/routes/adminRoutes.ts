import { Request, Response, Router } from "express";
import { findNewMovie } from "../controllers/SynoptixController";
import { Game } from "../models/Game";
import { GameModel } from "../models/mongo/Game/Game.model";
const router = Router();

let currentGame: Game;

router.get("/response", async (req: Request, res: Response) => {
  try {
    res.send(currentGame.title + currentGame.solutionPlainText);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/:movie", async (req: Request, res: Response) => {
  try {
    const { movie } = req.params;
    const { id: _id, title, synopsis } = await findNewMovie(movie);
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
});

export default router;
