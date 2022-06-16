import path from "path";
import fs from "fs";
import w2v, { Model } from "word2vec";
import { GameWordCloud, ShadowWord, WordCloud } from "../models/Word";
import { makeHollowWord } from "./string+utils";
let isLoading = false;
let model: Model;
const loadModel = async (): Promise<Model> => {
  return new Promise((resolve, reject) => {
    // console.log("loading model...");
    console.log("loading model...");
    // w2v.loadModel("./GoogleNews-vectors-negative300.bin", (error, model) => {
    const modelPath = path.normalize(
      "./frWac_non_lem_no_postag_no_phrase_200_skip_cut100.bin"
      // "./frWiki_no_phrase_no_postag_700_cbow_cut100.bin"
    );
    w2v.loadModel(
      modelPath,
      // "./frWac_non_lem_no_postag_no_phrase_200_cbow_cut0.bin",
      // "/home/thunder/Projects/synoptix/synoptix-back/GoogleNews-vectors-negative300.bin",
      // "/home/thunder/Projects/synoptix/synoptix-back/enwik9",
      // "./frWac_no_postag_no_phrase_700_skip_cut50.bin",
      //   "./frWiki_no_lem_no_postag_no_phrase_1000_skip_cut200.bin",
      // "./frWiki_no_phrase_no_postag_700_cbow_cut100.bin",
      // "./frWac_non_lem_no_postag_no_phrase_200_cbow_cut0.bin",
      // "./frwiki-20181020.treetag.2.ngram-pass2__2019-04-08_09.02__.s500_w5_skip.word2vec.bin",
      // "./frwiki-20181020.treetag.2__2019-01-24_10.41__.s500_w5_skip.word2vec.bin",
      (error, model) => {
        if (error) {
          reject(error);
        }
        console.log("model loaded");
        resolve(model);
      }
    );
  });
};

const startLoadingModel = async () => {
  isLoading = true;
  model = await loadModel();
  isLoading = false;
};

startLoadingModel();

export const compareWordWithCloud = async (
  requestedWord: string | number,
  clouds: GameWordCloud
): Promise<ShadowWord[]> => {
  if (!model && !isLoading) {
    await startLoadingModel();
  }
  const convertedRequestedWord = parseFloat(requestedWord.toString());
  const isANumber = !isNaN(convertedRequestedWord);
  if (isANumber) {
    return compareNumber(requestedWord as number, clouds.numberCloud);
  }
  if (requestedWord.toString().length === 1) {
    return compareSingleLetter(
      requestedWord as string,
      clouds.singleLetterCloud
    );
  }
  return compareWord(requestedWord as string, clouds.wordCloud);
  // const requestedWordLowerCased = requestedWord.toLocaleLowerCase();
  // const isRequestedWordANumber = !isNaN(parseInt(requestedWordLowerCased));
};

const compareWord = (requestedWord: string, wordCloud: WordCloud) => {
  const requestedWordLowerCased = requestedWord.toLocaleLowerCase();

  return Object.keys(wordCloud)
    .map<ShadowWord>((comparedWord: string, index): ShadowWord => {
      const comparedWordLowerCased = comparedWord.toLocaleLowerCase();

      if (requestedWordLowerCased === comparedWordLowerCased) {
        return {
          id: wordCloud[comparedWord],
          closestWord: comparedWord,
          shadowWord: makeHollowWord(comparedWord),
          similarity: 1,
        };
      }
      const similarity = model.similarity(
        requestedWordLowerCased,
        comparedWordLowerCased
      );

      return {
        id: wordCloud[comparedWord],
        closestWord: requestedWord,
        shadowWord: makeHollowWord(comparedWord),
        similarity,
      };
    })
    .filter(fewestSimilarityRateRequired(0.7));
};
const compareNumber = (
  requestedNumber: number,
  numberCloud: WordCloud
): ShadowWord[] => {
  return Object.keys(numberCloud)
    .map<ShadowWord>((comparedWord: string, index): ShadowWord => {
      const comparedNumber = parseFloat(comparedWord);
      if (requestedNumber === comparedNumber) {
        return {
          id: numberCloud[comparedWord],
          closestWord: comparedWord,
          shadowWord: makeHollowWord(comparedWord),
          similarity: 1,
        };
      }
      const absoluteRequestedNumber = Math.abs(requestedNumber);
      const absoluteComparedNumber = Math.abs(comparedNumber);
      const lowestNumber = Math.min(
        absoluteRequestedNumber,
        absoluteComparedNumber
      );
      const upperNumber = Math.max(
        absoluteRequestedNumber,
        absoluteComparedNumber
      );
      const similarity = lowestNumber / upperNumber;
      console.log(
        "requestedNumber",
        requestedNumber,
        "comparedNumber",
        comparedNumber,
        "==>",
        similarity
      );
      return {
        id: numberCloud[comparedWord],
        closestWord: requestedNumber.toString(),
        shadowWord: makeHollowWord(comparedWord),
        similarity,
      };
    })
    .filter(fewestSimilarityRateRequired(0.5));
};
const compareSingleLetter = (
  requestedLetter: string,
  letterCloud: WordCloud
): ShadowWord[] => {
  const requestedLetterLowerCased = requestedLetter.toLocaleLowerCase();
  return Object.keys(letterCloud)
  .map<ShadowWord>((comparedLetter: string, index): ShadowWord => {
      const comparedLetterLowerCased = comparedLetter.toLocaleLowerCase();
      if (requestedLetterLowerCased === comparedLetterLowerCased) {
        return {
          id: letterCloud[comparedLetter],
          closestWord: comparedLetter,
          shadowWord: makeHollowWord(comparedLetter),
          similarity: 1,
        };
      }
      const absoluteRequestedNumber = Math.abs(requestedLetter.charCodeAt(0));
      const absoluteComparedNumber = Math.abs(comparedLetter.charCodeAt(0));
      const lowestNumber = Math.min(
        absoluteRequestedNumber,
        absoluteComparedNumber
      );
      const upperNumber = Math.max(
        absoluteRequestedNumber,
        absoluteComparedNumber
      );
      const similarity = lowestNumber / upperNumber;
      return {
        id: letterCloud[comparedLetter],
        closestWord: requestedLetter,
        shadowWord: makeHollowWord(comparedLetter),
        similarity,
      };
    })
    .filter(fewestSimilarityRateRequired(0.5));
};

const isThisTheSameWord = (
  requestedWord: any,
  comparedWord: any
): ShadowWord => {
  const comparedWordLowerCased = comparedWord.toLocaleLowerCase();
  const requestedWordLowerCased = requestedWord.toLocaleLowerCase();

  if (requestedWordLowerCased === comparedWordLowerCased) {
    return {
      id: comparedWord,
      closestWord: comparedWord,
      shadowWord: makeHollowWord(comparedWord),
      similarity: 1,
    };
  }
};

const fewestSimilarityRateRequired = (rate: number) => (w: ShadowWord) =>
  w.similarity > rate;
