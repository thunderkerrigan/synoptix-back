import { mwn } from "mwn";
import { parseTemplates } from "mwn/build/wikitext";
import { PARAGRAPHS_REG_EXP, TABLE_MFSP_REG_EXP } from "../utils/Regexp";
import {
  clearingASCIISpaceFromText,
  clearingDivFromText,
  clearingLinkFromText,
} from "../utils/string+utils";

const wikipediaBot = new mwn({
  apiUrl: process.env.WIKIPEDIA_URL,
  username: process.env.WIKIPEDIA_LOGIN,
  password: process.env.WIKIPEDIA_PASSWORD,
});

const wiktionaryBot = new mwn({
  apiUrl: process.env.WIKTIONARY_URL,
  username: process.env.WIKTIONARY_LOGIN,
  password: process.env.WIKTIONARY_PASSWORD,
});

export const findNewMovie = async (movie: string) => {
  if (!wikipediaBot.loggedIn) {
    await wikipediaBot.login();
  }
  // search nearest movie from search term
  const findNearest = await wikipediaBot.search(movie + " movie", 1);

  // parsing synopsis parts
  const response = await wikipediaBot.parseTitle(findNearest[0].title, {
    section: "1", // synopsis is usually the first section
  });

  // pickups only text
  const sanitizedResponse = pickupParagraphs(response);

  // make grids
  return {
    id: findNearest[0].pageid,
    title: makeMovieTitle(findNearest[0].title),
    synopsis: clearingASCIISpaceFromText(
      clearingDivFromText(clearingLinkFromText(sanitizedResponse))
    ),
  };
};

export const findAllFormsForWord = async (word: string): Promise<string[]> => {
  if (!wiktionaryBot.loggedIn) {
    await wiktionaryBot.login();
  }
  // search nearest movie from search term
  const findNearest = await wiktionaryBot.search(word, 2);

  interface WordForm {
    male?: string;
    female?: string;
    males?: string;
    females?: string;
  }

  const FORMS = ["ms", "fs", "fp", "mp"];
  // parsing synopsis parts
  const response = await Promise.all(
    findNearest.map(async (item) => {
      const r = await wiktionaryBot.read(item.title);
      const content = r.revisions[0].content;
      const template = parseTemplates(content, {
        namePredicate: (name) => name === "Fr-accord-mixte",
      });

      return template
        .map((item) => {
          if (item.name === "Fr-accord-mixte") {
            return item.parameters
              .filter((i) => FORMS.includes(i.name.toString()))
              .map((i) => i.value);
          }
          return [];
        })
        .reduce<string[]>((acc, cur) => {
          if (
            cur.some((i) => i.toLocaleLowerCase() === word.toLocaleLowerCase())
          ) {
            cur.forEach((i) => !acc.includes(i) && acc.push(i.toString()));
          }
          return acc;
        }, []);
    })
  );
  return [[word], ...response].reduce<string[]>(
    (acc, cur) => [...acc, ...cur],
    []
  );
};

const pickupParagraphs = (text: string): string => {
  const matches = text.match(PARAGRAPHS_REG_EXP);
  return matches.join("");
};

const makeMovieTitle = (movie: string) =>
  "<p>" + movie.split("_").join(" ") + "</p>";
