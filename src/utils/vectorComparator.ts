import path from "path";
import w2v, { Model } from "word2vec";
import { GameWordCloud, ShadowWord, WordCloud } from "../models/Word";
import { makeHollowWord } from "./string+utils";
import { findAllFormsForWord } from "../controllers/SynoptixController";
import { connect, connection } from "mongoose";

let isLoading = false;
let model: Model;

connect(process.env.MONGO_DB_HOST, {
  user: process.env.MONGO_DB_USER,
  dbName: process.env.MONGO_DB_DATABASE,
  pass: process.env.MONGO_DB_PASS,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
});

connection.once("open", async () => {
  console.log("connected to database");
});

const loadModel = async (): Promise<Model> => {
  return new Promise((resolve, reject) => {
    console.log("loading model...");
    const modelPath = path.normalize(
      "./frWac_non_lem_no_postag_no_phrase_200_skip_cut100.bin"
    );
    w2v.loadModel(modelPath, (error, model) => {
      if (error) {
        reject(error);
      }
      console.log("model loaded");
      resolve(model);
    });
  });
};

export const startLoadingModel = async () => {
  isLoading = true;
  model = await loadModel();
  isLoading = false;
};

startLoadingModel();

export const checkWordInModel = (word: string): Record<string, number> => {
  const isANumber = !isNaN(parseFloat(word));
  const vector = model.getVector(word.toLocaleLowerCase());
  if (vector === null || isANumber) {
    return {};
  }
  const nearestWords = model.getNearestWords(vector, 20);
  return nearestWords.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.word] = cur.dist;
    return acc;
  }, {});
};

export const compareWordWithCloud = async (
  requestedWord: string | number,
  clouds: GameWordCloud,
  currentCache: Record<string, ShadowWord[]>
): Promise<{ score: ShadowWord[]; cache: Record<string, ShadowWord[]> }> => {
  if (!model && !isLoading) {
    await startLoadingModel();
  }
  const convertedRequestedWord = parseFloat(requestedWord.toString());
  const isANumber = !isNaN(convertedRequestedWord);
  if (isANumber) {
    return compareNumber(
      requestedWord as number,
      clouds.numberCloud,
      currentCache
    );
  }
  if (requestedWord.toString().length === 1) {
    return compareSingleLetter(
      requestedWord as string,
      clouds.singleLetterCloud,
      currentCache
    );
  }

  const otherWordForms = await findAllFormsForWord(requestedWord as string);

  const rawWords = await Promise.all(
    otherWordForms.map((w) => compareWord(w, clouds.wordCloud, currentCache))
  );

  const words = rawWords.reduce<{
    score: Record<number, ShadowWord>;
    cache: Record<string, ShadowWord[]>;
  }>(
    (acc, curr) => {
      curr.score.forEach((shadowWord) => {
        const existingShadowWord = acc.score[shadowWord.id];
        if (
          !existingShadowWord ||
          (existingShadowWord &&
            existingShadowWord.similarity < shadowWord.similarity)
        ) {
          acc.score[shadowWord.id] = shadowWord;
        }
      });
      acc.cache = { ...acc.cache, ...curr.cache };
      return acc;
    },
    { score: {}, cache: currentCache }
  );

  return { score: Object.values(words.score), cache: words.cache };
  // return compareWord(requestedWord as string, clouds.wordCloud);
  // const requestedWordLowerCased = requestedWord.toLocaleLowerCase();
  // const isRequestedWordANumber = !isNaN(parseInt(requestedWordLowerCased));
};

const compareWord = async (
  requestedWord: string,
  wordCloud: WordCloud,
  currentCache: Record<string, ShadowWord[]>
): Promise<{ score: ShadowWord[]; cache: Record<string, ShadowWord[]> }> => {
  // cached request exist; returning it
  if (currentCache[requestedWord]) {
    return { score: currentCache[requestedWord], cache: currentCache };
  }
  const requestedWordLowerCased = requestedWord.toLocaleLowerCase();
  if (model.getVector(requestedWordLowerCased) === null) {
    // word does not exist in model; skipping useless search
    return { score: [], cache: currentCache };
  }

  const rawClouds = Object.keys(wordCloud).map<Promise<ShadowWord>>(
    async (comparedWord: string): Promise<ShadowWord> => {
      const comparedWordLowerCased = comparedWord.toLocaleLowerCase();

      if (requestedWordLowerCased === comparedWordLowerCased) {
        return {
          id: wordCloud[comparedWord].id,
          closestWord: comparedWord,
          shadowWord: makeHollowWord(comparedWord),
          similarity: 1,
        };
      }
      return {
        id: wordCloud[comparedWord].id,
        closestWord: requestedWord,
        shadowWord: makeHollowWord(comparedWord),
        similarity:
          wordCloud[comparedWord].nearestWords[requestedWordLowerCased] || 0,
      };
    }
  );

  const clouds = await Promise.all(rawClouds);
  const score = clouds.filter(fewestSimilarityRateRequired(0.1));

  return {
    score,
    cache: { ...currentCache, [requestedWord]: score },
  };
};
const compareNumber = (
  requestedNumber: number,
  numberCloud: WordCloud,
  currentCache: Record<string, ShadowWord[]>
): { score: ShadowWord[]; cache: Record<string, ShadowWord[]> } => {
  if (currentCache[requestedNumber]) {
    return { score: currentCache[requestedNumber], cache: currentCache };
  }
  const clouds = Object.keys(numberCloud)
    .map<ShadowWord>((comparedWord: string, index): ShadowWord => {
      const comparedNumber = parseFloat(comparedWord);
      if (requestedNumber === comparedNumber) {
        return {
          id: numberCloud[comparedWord].id,
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

      return {
        id: numberCloud[comparedWord].id,
        closestWord: requestedNumber.toString(),
        shadowWord: makeHollowWord(comparedWord),
        similarity,
      };
    })
    .filter(fewestSimilarityRateRequired(0.5));
  return {
    score: clouds,
    cache: { ...currentCache, [requestedNumber]: clouds },
  };
};
const compareSingleLetter = (
  requestedLetter: string,
  letterCloud: WordCloud,
  currentCache: Record<string, ShadowWord[]>
): { score: ShadowWord[]; cache: Record<string, ShadowWord[]> } => {
  if (currentCache[requestedLetter]) {
    return { score: currentCache[requestedLetter], cache: currentCache };
  }
  const requestedLetterLowerCased = requestedLetter.toLocaleLowerCase();
  const clouds = Object.keys(letterCloud)
    .map<ShadowWord>((comparedLetter: string, index): ShadowWord => {
      const comparedLetterLowerCased = comparedLetter.toLocaleLowerCase();
      if (requestedLetterLowerCased === comparedLetterLowerCased) {
        return {
          id: letterCloud[comparedLetter].id,
          closestWord: comparedLetter,
          shadowWord: makeHollowWord(comparedLetter),
          similarity: 1,
        };
      }
      const absoluteRequestedNumber = Math.abs(
        requestedLetterLowerCased.charCodeAt(0)
      );
      const absoluteComparedNumber = Math.abs(
        comparedLetterLowerCased.charCodeAt(0)
      );
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
        id: letterCloud[comparedLetter].id,
        closestWord: requestedLetter,
        shadowWord: makeHollowWord(comparedLetter),
        similarity,
      };
    })
    .filter(fewestSimilarityRateRequired(0.5));
  return {
    score: clouds,
    cache: { ...currentCache, [requestedLetter]: clouds },
  };
};

const fewestSimilarityRateRequired = (rate: number) => (w: ShadowWord) =>
  w.similarity > rate;
