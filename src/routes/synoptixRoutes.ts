import { Request, Response, Router } from "express";
import { mwn } from "mwn";
import { ShadowWord, ShadowWordsCloud, Word } from "../models/Word";
import { makeHollowWord } from "../utils/string+utils";
import { compareWordWithCloud } from "../utils/vectorComparator";
const router = Router();
const bot = new mwn({
  apiUrl: "https://fr.wikipedia.org/w/api.php",
  username: process.env.WIKI_LOGIN,
  password: process.env.WIKI_PASSWORD,
});

// regexp
const FULL_REG_EXP = /([\p{Letter}]+)|([\p{Number}]+)|(.+?)/gu;
const WORDS_REG_EXP = /([\p{Letter}]+)|([\p{Number}]+)/gu;
const HTML_LINK_CONTENT = /(<a href=.+?>)|(<\/a>)/g;
const UNWANTED_HTML_CONTENT =
  /(<div .+?>(.|\n)+?<\/div>)|(<sup .+?>(.|\n)+?<\/sup>)/g;

let currentMovieWordCloud: Word = {};
let currentMovieSynopsis: ShadowWordsCloud = [];

router.get("/:movie", async (req: Request, res: Response) => {
  try {
    if (!bot.loggedIn) {
      bot.login();
    }
    const { movie } = req.params;
    // search nearest movie from search term
    const findnearest = await bot.search(movie + " movie", 1);
    // console.log("nearest:", findnearest[0].title);
    // console.log("nearest:", findnearest[0].sectionsnippet);

    // parsing synopsis parts
    const response = await bot.parseTitle(findnearest[0].title, {
      section: "1", // synopsis is usually the first section
    });
    // const sanitizedResponse = response.split("</h3>").pop();

    // pickups only text
    const sanitizedResponse = pickupParagraphs(response);

    // make grids
    const fullText =
      makeMovieTitle(findnearest[0].title) +
      clearingDivFromText(clearingLinkFromText(sanitizedResponse));
    makeWordCloud(fullText); // <-- !important!
    const synopsis = transformToWords(fullText);
    currentMovieSynopsis = transformToWords(fullText, true);
    res.send(synopsis);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/score/:word", async (req: Request, res: Response) => {
  const { word } = req.params;
  const score = await compareWordWithCloud(word, currentMovieWordCloud);
  return res.send(score);
});

const clearingLinkFromText = (text: string) =>
  text.replace(HTML_LINK_CONTENT, "");

const clearingDivFromText = (text: string) =>
  text.replace(UNWANTED_HTML_CONTENT, "");

const makeWordCloud = (text: string) => {
  currentMovieWordCloud = text
    .match(WORDS_REG_EXP)
    .reduce<Word>((set, item) => {
      if (!set[item]) {
        set[item] = Object.keys(set).length;
      }
      return set;
    }, {});
};

const transformToWords = (
  text: string,
  showTrueWord = false
): ShadowWordsCloud => {
  const removedFirstParagraphs = text.replace(/<p>/g, "");
  const splittedParaphraphs = removedFirstParagraphs
    .split("</p>")
    .filter((item) => item !== "");
  return splittedParaphraphs.map((paragraph) => {
    const splits = paragraph.match(FULL_REG_EXP);
    const words = splits.map<ShadowWord>((split: string): ShadowWord => {
      if (split.match(WORDS_REG_EXP)) {
        // it's a word
        const id = currentMovieWordCloud[split];
        return {
          id,
          closestWord: showTrueWord ? split : "",
          shadowWord: makeHollowWord(split),
          similarity: 0,
        };
      } else {
        return {
          id: -1,
          closestWord: split,
          shadowWord: makeHollowWord(split),
          similarity: 1,
        };
      }
    });
    return words;
  });
};

const pickupParagraphs = (text: string): string => {
  const paragraphsRegexp = /(<p>(.+)\s<\/p>)/gmu;
  const matches = text.match(paragraphsRegexp);
  return matches.join("");
};

const makeMovieTitle = (movie: string) =>
  "<p>" + movie.split("_").join(" ") + "</p>";

export default router;
