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
import { SPARQLResponse } from "../models/api";
import { WordModel } from "../models/mongo/Word/Word.model";
import { CUSTOM_HEADERS } from "../SPARQL/constants";
import {
  ALL_CONJUGATION_WORD_QUERY,
  ALL_FORMS_WORD_QUERY,
  LEMATIZE_WORD_QUERY,
} from "../SPARQL/request";

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
          section.header === "Synopsis" ||
          section.header === "Synopsis détaillé"
      )
      .reduce<Record<string, string>>((acc, section) => {
        return { ...acc, [section.header]: section.content };
      }, {});
    const text =
      section["Synopsis détaillé"] ||
      section["Intrigue"] ||
      section["Synopsis"] ||
      "";

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
  const cachedWord = await WordModel.findOneContaining(word);
  if (cachedWord) {
    // console.log("Found in cache");

    return cachedWord.linkedWord;
  }
  try {
    const lemma: SPARQLResponse<"l"> = await wiktionaryBot.sparqlQuery(
      LEMATIZE_WORD_QUERY(word),
      "https://query.wikidata.org/sparql",
      { headers: CUSTOM_HEADERS }
    );
    const lexemes = lemma.results.bindings.map((b) =>
      b.l.value.split("/").pop()
    );
    const wordRequests = lexemes.map(
      (lemma): Promise<SPARQLResponse<"formLabel">> =>
        wikipediaBot.sparqlQuery(
          ALL_FORMS_WORD_QUERY(lemma),
          "https://query.wikidata.org/sparql",
          { headers: CUSTOM_HEADERS }
        )
    );
    const conjugationRequests = lexemes.map(
      (lemma): Promise<SPARQLResponse<"formLabel">> =>
        wikipediaBot.sparqlQuery(
          ALL_CONJUGATION_WORD_QUERY(lemma),
          "https://query.wikidata.org/sparql",
          { headers: CUSTOM_HEADERS }
        )
    );
    const linkedWord = await Promise.all([
      ...wordRequests,
      ...conjugationRequests,
    ]);
    let newWords = linkedWord.reduce<string[]>((acc, response) => {
      return [
        ...acc,
        ...response.results.bindings
          .map((b) =>
            /[\p{L}|\-]+/gu.exec(b.formLabel.value.toLocaleLowerCase()).pop()
          )
          .reduce<string[]>((acc, _word) => {
            console.log("ACC", acc);
            if (acc.includes(_word)) {
              return acc;
            } else {
              return [...acc, _word];
            }
          }, [])
          .filter((i) => !acc.includes(i)),
      ];
    }, []);
    if (newWords.length === 0) {
      // missing word in wiktionary; better not cache it
      return [word.toLocaleLowerCase()];
    }

    await WordModel.create(
      newWords.map((w) => ({ value: w, linkedWord: [...newWords] }))
    );
    return newWords;
  } catch (error) {
    console.log(error);
  }
  return [];
  // search nearest movie from search term
  // const findNearest = await wiktionaryBot.search(word, 2, "redirectsnippet");
  // const pages = await wiktionaryBot.read(findNearest.map((page) => page.title));
  // const FORMS = ["ms", "fs", "fp", "mp"];
  // // parsing synopsis parts

  // const response = await Promise.all(
  //   pages.map(async (page) => {
  //     console.log(page.revisions[0].content);

  //     // const r = await wiktionaryBot.read(item.title);
  //     const content = page.revisions[0].content;
  //     const template = parseTemplates(content, {
  //       namePredicate: (name) => /fr-accord/gi.test(name),
  //     });
  //     // wiktionaryBot.sparqlQuery()
  //     return template
  //       .map((item) => {
  //         if (typeof item.name === "string" && /fr-accord/gi.test(item.name)) {
  //           return item.parameters
  //             .filter((i) => FORMS.includes(i.name.toString()))
  //             .map((i) => i.value);
  //         }
  //         return [];
  //       })
  //       .reduce<string[]>((acc, cur) => {
  //         if (
  //           cur.some((i) => i.toLocaleLowerCase() === word.toLocaleLowerCase())
  //         ) {
  //           cur.forEach((i) => !acc.includes(i) && acc.push(i.toString()));
  //         }
  //         return acc;
  //       }, []);
  //   })
  // );
  // return [[word], ...response].reduce<string[]>(
  //   (acc, cur) => [...acc, ...cur.filter((i) => !acc.includes(i))],
  //   []
  // );
};

const pickupParagraphs = (text: string): string => {
  const matches = text.match(PARAGRAPHS_REG_EXP);
  return matches.join("");
};

const makeMovieTitle = (movie: string) =>
  "<p>" + movie.split("_").join(" ") + "</p>";
