import { Router } from "express";
import { mwn } from "mwn";
const router = Router();

router.get("/:movie", async (req, res) => {
  try {
    const { movie } = req.params;
    // const sanitizedMovie = movie.split("_").join(" ");
    // console.log("sanity check: ", sanitizedMovie);
    const bot = await mwn.init({
      apiUrl: "https://fr.wikipedia.org/w/api.php",
      username: process.env.WIKI_LOGIN,
      password: process.env.WIKI_PASSWORD,
    });
    const response = await bot.parseTitle(movie, {
      section: "1",
      prop: "text",
    });
    res.send(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
