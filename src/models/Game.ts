import {
  FULL_REG_EXP,
  HTML_TAGS_REG_EXP,
  WORDS_REG_EXP,
} from "../utils/Regexp";
import { makeHollowWord } from "../utils/string+utils";
import { GameWordCloud, ShadowWord, ShadowWordsCloud, WordCloud } from "./Word";

export interface RedactedGame {
  gameID: number;
  foundBy: number;
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
}

export interface Game extends RedactedGame {
  id: number;
  title: string;
  foundByIDs: string[];
  solution: ShadowWordsCloud;
  solutionPlainText: string;
  wordCloud: GameWordCloud; // word cloud of the synopsis
  cache: Record<string, ShadowWord[]>; // cache of previous scored words
  checkWinningCondition: (userID: string, candidateIDs: string[]) => boolean;
  redactedGame: () => RedactedGame;
  makeWordCloud: (text: string) => GameWordCloud;
  transformToShadowCloud: (
    text: string,
    wordClouds: GameWordCloud,
    minimumRevealWord?: number
  ) => ShadowWordsCloud;
}

export class Game implements Game {
  id: number;
  title: string;
  foundByIDs: string[];
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
  solution: ShadowWordsCloud;
  solutionPlainText: string;
  wordCloud: GameWordCloud; // word cloud of the synopsis
  cache: Record<string, ShadowWord[]>;
  constructor(id: number, title: string, synopsisText: string) {
    this.id = id;
    this.title = title;
    this.foundByIDs = [];
    this.solutionPlainText = synopsisText;
    this.wordCloud = this.makeWordCloud(title + " " + synopsisText);
    this.cache = {};
    this.redactedTitle = this.transformToShadowCloud(title, this.wordCloud);
    this.redactedSynopsis = this.transformToShadowCloud(
      synopsisText,
      this.wordCloud
    );
    this.solution = this.transformToShadowCloud(
      synopsisText,
      this.wordCloud,
      0
    );
  }
  get foundBy() {
    return this.foundByIDs.length;
  }

  makeWordCloud = (text: string): GameWordCloud => {
    const allWordsCloud = text
      .match(WORDS_REG_EXP)
      .reduce<WordCloud>((set, item) => {
        if (!set[item]) {
          set[item] = { id: Object.keys(set).length, appearanceCount: 1 };
        } else {
          set[item].appearanceCount++;
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
    minimumRevealWord: number = 1000
  ): ShadowWordsCloud => {
    const removedFirstParagraphs = text.replace(/<p>/g, "");
    const splittedParaphraphs = removedFirstParagraphs
      .split("</p>")
      .filter((item) => item !== "");
    return splittedParaphraphs.map((paragraph) => {
      const splits = paragraph.match(FULL_REG_EXP);
      const words = splits.map<ShadowWord>((split: string): ShadowWord => {
        const matches = split.match(WORDS_REG_EXP);
        if (matches && matches[0].length === split.length) {
          // it's a word
          const { id, appearanceCount } = wordCloud.allWordsCloud[split];
          return {
            id,
            closestWord: appearanceCount > minimumRevealWord ? split : "",
            shadowWord: makeHollowWord(split),
            similarity: appearanceCount > minimumRevealWord ? 1 : 0,
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
  redactedGame = (): RedactedGame => {
    return {
      gameID: this.id,
      foundBy: this.foundBy,
      redactedTitle: this.redactedTitle,
      redactedSynopsis: this.redactedSynopsis,
    };
  };
  checkWinningCondition = (userID: string, candidateIDs: string[]): boolean => {
    if (!this.foundByIDs.includes(userID)) {
      const solutionIDs = this.redactedTitle
        .reduce((acc, curr) => [...acc, ...curr], [])
        .map((word) => word.id.toString());
      if (solutionIDs.every((id) => candidateIDs.includes(id.toString()))) {
        this.foundByIDs.push(userID);
        return true;
      }
      return false;
    }
    return true;
  };
}
