import { mwn } from "mwn";
import fs from "fs";
import wikitext, { parseTemplates, parseSections } from "mwn/build/wikitext";
import {
  PARAGRAPHS_REG_EXP,
  TABLE_MFSP_REG_EXP,
  WIKI_DATE_REG_EXP,
  WIKI_FILE_REG_EXP,
  WIKI_HEADER_REG_EXP,
  WIKI_TEXT_REG_EXP,
} from "../utils/Regexp";
import {
  clearingASCIISpaceFromText,
  clearingDivFromText,
  clearingLinkFromText,
} from "../utils/string+utils";
import { WikipediaMovie } from "../models/Word";

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

export const findNewMovie = async (movie: string): Promise<WikipediaMovie> => {
  if (!wikipediaBot.loggedIn) {
    await wikipediaBot.login();
  }
  // search nearest movie from search term
  const findNearest = await wikipediaBot.search(movie + " movie", 1);

  // parsing synopsis parts
  // const response = await wikipediaBot.parseTitle(findNearest[0].title, {
  //   section: "1", // synopsis is usually the first section
  // });
  const foundMovieCandidate = findNearest[0].title;
  if (foundMovieCandidate) {
    const page = await wikipediaBot.read(foundMovieCandidate);
    const { content } = page.revisions[0];
    const section = parseSections(content)
      .filter(
        (section) =>
          section.header === "Intrigue" ||
          section.header === "Synopsis détaillé"
      )
      .reduce<Record<string, string>>((acc, section) => {
        return { ...acc, [section.header]: section.content };
      }, {});
    const text = section["Synopsis détaillé"] || section["Intrigue"] || "";

    const sanitizedSynopsisWikiText = text
      .replace(WIKI_HEADER_REG_EXP, "")
      .replace(WIKI_FILE_REG_EXP, "")
      .replace(WIKI_TEXT_REG_EXP, (_, text) => text.split("|").pop())
      .replace(WIKI_DATE_REG_EXP, (_, text) => text.split("|").join(" "));
    const synopsisHTML = await wikipediaBot.parseWikitext(
      sanitizedSynopsisWikiText
    );
    const sanitizedResponse = pickupParagraphs(synopsisHTML);
    return {
      id: page.pageid,
      title: makeMovieTitle(page.title),
      synopsis: clearingASCIISpaceFromText(
        clearingDivFromText(clearingLinkFromText(sanitizedResponse))
      ),
    };
  }
  throw new Error("Movie not found");
};

export const findAllFormsForWord = async (word: string): Promise<string[]> => {
  if (!wiktionaryBot.loggedIn) {
    await wiktionaryBot.login();
  }
  // search nearest movie from search term
  const findNearest = await wiktionaryBot.search(word, 2);

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
