import { mwn } from "mwn";
import { PARAGRAPHS_REG_EXP } from "../utils/Regexp";
import {
  clearingDivFromText,
  clearingLinkFromText,
} from "../utils/string+utils";

const bot = new mwn({
  apiUrl: process.env.WIKI_URL,
  username: process.env.WIKI_LOGIN,
  password: process.env.WIKI_PASSWORD,
});

export const findNewMovie = async (movie: string) => {
  if (!bot.loggedIn) {
    await bot.login();
  }
  // search nearest movie from search term
  const findnearest = await bot.search(movie + " movie", 1);

  // parsing synopsis parts
  const response = await bot.parseTitle(findnearest[0].title, {
    section: "1", // synopsis is usually the first section
  });

  // pickups only text
  const sanitizedResponse = pickupParagraphs(response);

  // make grids
  return (
    makeMovieTitle(findnearest[0].title) +
    clearingDivFromText(clearingLinkFromText(sanitizedResponse))
  );
};

const pickupParagraphs = (text: string): string => {
  const matches = text.match(PARAGRAPHS_REG_EXP);
  return matches.join("");
};

const makeMovieTitle = (movie: string) =>
  "<p>" + movie.split("_").join(" ") + "</p>";
