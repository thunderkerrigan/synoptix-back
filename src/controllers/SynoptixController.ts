import { mwn } from "mwn";
import fs from "fs";
import wikitext, { parseTemplates, parseSections } from "mwn/build/wikitext";
import {
  PARAGRAPHS_REG_EXP,
  REF_REG_EXP,
  SMALL_NOTE_REG_EXP,
  TABLE_MFSP_REG_EXP,
  UNWANTED_TITLE_WORDS_REG_EXP,
  WIKI_COMMA_REG_EXP,
  WIKI_DATE_REG_EXP,
  WIKI_FILE_REG_EXP,
  WIKI_HEADER_REG_EXP,
  WIKI_LANGUAGE_REG_EXP,
  WIKI_OTHER_REG_EXP,
  WIKI_TEXT_REG_EXP,
  WIKI_UNITE_REG_EXP,
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
  const foundMovieCandidate = findNearest[0] ? findNearest[0].title : undefined;
  if (foundMovieCandidate) {
    const page = await wikipediaBot.read(foundMovieCandidate);
    const { content } = page.revisions[0];
    const section = parseSections(content)
      .filter(
        (section) =>
          section.header === "Intrigue" ||
          section.header === "Synopsis" ||
          section.header === "Résumé détaillé" ||
          section.header === "Résumé" ||
          section.header === "Synopsis détaillé"
      )
      .reduce<Record<string, string>>((acc, section) => {
        return { ...acc, [section.header]: section.content };
      }, {});
    const text =
      section["Synopsis détaillé"] ||
      section["Résumé détaillé"] ||
      section["Résumé"] ||
      section["Intrigue"] ||
      section["Synopsis"] ||
      "";
    const untreatedSynopsis = await wikipediaBot.parseWikitext(text);
    const sanitizedSynopsisWikiText = text
      .replace(WIKI_HEADER_REG_EXP, "")
      .replace(WIKI_FILE_REG_EXP, "")
      .replace(REF_REG_EXP, "")
      .replace(SMALL_NOTE_REG_EXP, "")
      .replace(WIKI_LANGUAGE_REG_EXP, (_, text) => text.split("|").pop())
      .replace(WIKI_COMMA_REG_EXP, "")
      .replace(WIKI_TEXT_REG_EXP, (_, text) => text.split("|").pop())
      .replace(WIKI_UNITE_REG_EXP, (_, text) => text.split("|").join(" "))
      .replace(WIKI_DATE_REG_EXP, (_, text) => text.split("|").join(" "))
      .replace(WIKI_OTHER_REG_EXP, (_, text) => text.split("|").join(" "));
    const synopsisHTML = await wikipediaBot.parseWikitext(
      sanitizedSynopsisWikiText
    );
    const sanitizedResponse = pickupParagraphs(synopsisHTML);
    const sanitizedSynopsis = clearingASCIISpaceFromText(
      clearingDivFromText(clearingLinkFromText(sanitizedResponse))
    );
    return {
      id: page.pageid,
      title: makeMovieTitle(page.title),
      synopsis: sanitizedSynopsis,
      untreatedSynopsis,
    };
  }
  throw new Error("Movie not found");
};

export const findAllFormsForWord = async (word: string): Promise<string[]> => {
  try {
    if (!wiktionaryBot.loggedIn) {
      await wiktionaryBot.login();
    }
    const cachedWord = await WordModel.findOneContaining(word);
    if (cachedWord) {
      return cachedWord.linkedWord;
    }
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
    } else {
      await WordModel.create(
        newWords.map((w) => ({ value: w, linkedWord: [...newWords] }))
      );
      return newWords;
    }
  } catch (error) {
    return [word.toLocaleLowerCase()];
  }
};

const pickupParagraphs = (text: string): string => {
  const matches = text.match(PARAGRAPHS_REG_EXP);
  return matches.join("");
};

const makeMovieTitle = (movie: string) =>
  "<p>" +
  movie.replace(UNWANTED_TITLE_WORDS_REG_EXP, "").split("_").join(" ") +
  "</p>";
