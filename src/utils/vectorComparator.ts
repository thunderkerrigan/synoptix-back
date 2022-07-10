import { GameWordCloud, ShadowWord, WordCloud } from "../models/Word";
import { makeHollowWord } from "./string+utils";
import { findAllFormsForWord } from "../controllers/SynoptixController";
import { roundOff } from "./number+utils";

export const compareWordWithCloud = async (
  requestedWord: string | number,
  clouds: GameWordCloud,
  currentCache: Record<string, ShadowWord[]>
): Promise<{ score: ShadowWord[]; cache: Record<string, ShadowWord[]> }> => {
  const convertedRequestedWord = parseFloat(requestedWord.toString());
  const isANumber = !isNaN(convertedRequestedWord);
  if (isANumber) {
    return compareNumber(
      convertedRequestedWord,
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
        const isMissingOrBetter =
          !existingShadowWord ||
          (existingShadowWord &&
            existingShadowWord.similarity < shadowWord.similarity);
        if (isMissingOrBetter) {
          acc.score[shadowWord.id] = shadowWord;
        }
      });
      acc.cache = { ...acc.cache, ...curr.cache };
      return acc;
    },
    { score: {}, cache: currentCache }
  );

  return { score: Object.values(words.score), cache: words.cache };
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

  const clouds = Object.keys(wordCloud).map<ShadowWord>(
    (comparedWord: string): ShadowWord => {
      if (
        requestedWord.localeCompare(comparedWord, "fr", {
          sensitivity: "base",
        }) === 0
      ) {
        return {
          id: wordCloud[comparedWord].id,
          closestWord: comparedWord,
          shadowWord: makeHollowWord(comparedWord),
          similarity: 1,
        };
      }
      const { nearestWords } = wordCloud[comparedWord];
      return {
        id: wordCloud[comparedWord].id,
        closestWord: requestedWord,
        shadowWord: makeHollowWord(comparedWord),
        similarity: nearestWords[requestedWordLowerCased] || 0,
      };
    }
  );

  // const clouds = await Promise.all(rawClouds);
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
    .map<ShadowWord>((comparedWord: string): ShadowWord => {
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
        similarity: similarity,
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

      if (
        comparedLetter.localeCompare(requestedLetter, "fr", {
          sensitivity: "base",
        }) === 0
      ) {
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
      const similarity = roundOff(lowestNumber / upperNumber, 2);
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
