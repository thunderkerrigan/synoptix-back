import { FULL_REG_EXP, WORDS_REG_EXP } from "../utils/Regexp";
import { makeHollowWord } from "../utils/string+utils";
import { GameWordCloud, ShadowWord, ShadowWordsCloud, WordCloud } from "./Word";

export interface Game {
  id: number;
  title: string;
  synopsis: ShadowWordsCloud;
  solution: ShadowWordsCloud;
  solutionPlainText: string;
  wordCloud: GameWordCloud; // word cloud of the synopsis
  makeWordCloud: (text: string) => GameWordCloud;
  transformToShadowCloud: (
    text: string,
    wordClouds: GameWordCloud,
    revealWord?: boolean
  ) => ShadowWordsCloud;
}

export class Game implements Game {
  id: number;
  title: string;
  synopsis: ShadowWordsCloud;
  solution: ShadowWordsCloud;
  solutionPlainText: string;
  wordCloud: GameWordCloud; // word cloud of the synopsis

  constructor(id: number, title: string, synopsisText: string) {
    this.id = id;
    this.title = title;
    this.solutionPlainText = synopsisText;
    this.wordCloud = this.makeWordCloud(synopsisText);
    this.synopsis = this.transformToShadowCloud(synopsisText, this.wordCloud);
    this.solution = this.transformToShadowCloud(
      synopsisText,
      this.wordCloud,
      true
    );
  }
  makeWordCloud = (text: string): GameWordCloud => {
    const allWordsCloud = text
      .match(WORDS_REG_EXP)
      .reduce<WordCloud>((set, item) => {
        if (!set[item]) {
          set[item] = Object.keys(set).length;
        }
        return set;
      }, {});
    const singleLetterCloud = Object.keys(allWordsCloud)
      .filter((i) => i.length === 1 && isNaN(parseFloat(i)))
      .reduce<WordCloud>((set, item) => {
        set[item] = allWordsCloud[item];
        return set;
      }, {});
    const numberCloud = Object.keys(allWordsCloud)
      .filter((i) => !isNaN(parseFloat(i)))
      .reduce<WordCloud>((set, item) => {
        set[item] = allWordsCloud[item];
        return set;
      }, {});
    const wordCloud = Object.keys(allWordsCloud)
      .filter((i) => i.length > 1 && isNaN(parseFloat(i)))
      .reduce<WordCloud>((set, item) => {
        set[item] = allWordsCloud[item];
        return set;
      }, {});
    return {
      allWordsCloud,
      singleLetterCloud,
      numberCloud,
      wordCloud,
    };
  };

  transformToShadowCloud = (
    text: string,
    wordCloud: GameWordCloud,
    revealWord?: boolean
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
          const id = wordCloud.allWordsCloud[split];
          return {
            id,
            closestWord: revealWord ? split : "",
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
}
