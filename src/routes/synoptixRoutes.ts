import { Request, Response, Router } from "express";
import { findNewMovie } from "../controllers/SynoptixController";
import { Game } from "../models/Game";
import { compareWordWithCloud } from "../utils/vectorComparator";
const router = Router();

let currentGame: Game;

router.get("/", async (req: Request, res: Response) => {
  try {
    res.send(currentGame.synopsis);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/response", async (req: Request, res: Response) => {
  try {
    res.send(currentGame.solutionPlainText);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/:movie", async (req: Request, res: Response) => {
  try {
    const { movie } = req.params;
    const fullText = await findNewMovie(movie);
    currentGame = new Game(1, movie, fullText);
    res.send(currentGame.synopsis);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/score/:word", async (req: Request, res: Response) => {
  const { word } = req.params;
  const score = await compareWordWithCloud(word, currentGame.wordCloud);
  return res.send(score);
});

export default router;
