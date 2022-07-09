import { checkWordInModel } from "../controllers/ModelController";
import {
  FULL_REG_EXP,
  HTML_TAGS_REG_EXP,
  WORDS_REG_EXP,
} from "../utils/Regexp";
import { makeHollowWord } from "../utils/string+utils";
import { IGame } from "./mongo/Game/Game.types";
import { GameWordCloud, ShadowWord, ShadowWordsCloud, WordCloud } from "./Word";

export interface RedactedGame {
  gameID: number;
  gameNumber: number;
  lastMovie: string;
  foundBy: number;
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
}

export interface Game extends Omit<RedactedGame, "gameID"> {
  _id: number;
  dayNumber: number;
  title: string;
  date?: String;
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
  _id: number;
  title: string;
  date?: String;
  foundByIDs: string[];
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
  solution: ShadowWordsCloud;
  solutionPlainText: string;
  wordCloud: GameWordCloud; // word cloud of the synopsis
  cache: Record<string, ShadowWord[]>;
  constructor(
    _object: {
      _id: number;
      title: string;
      solutionPlainText: string;
    } & Partial<Game>
  ) {
    this._id = _object._id;
    this.title = _object.title;
    this.date = _object.date;
    this.dayNumber = _object.dayNumber || 0;
    this.lastMovie = _object.lastMovie || "";
    this.foundByIDs = _object.foundByIDs || [];
    this.solutionPlainText = _object.solutionPlainText;
    this.wordCloud =
      _object.wordCloud ||
      this.makeWordCloud(this.title + " " + this.solutionPlainText);
    this.redactedTitle =
      _object.redactedTitle ||
      this.transformToShadowCloud(this.title, this.wordCloud);
    this.cache = {};
    this.redactedSynopsis =
      _object.redactedSynopsis ||
      this.transformToShadowCloud(this.solutionPlainText, this.wordCloud);
    this.solution =
      _object.solution ||
      this.transformToShadowCloud(this.solutionPlainText, this.wordCloud, 0);
  }
  get foundBy() {
    return this.foundByIDs.length;
  }

  makeWordCloud = (text: string): GameWordCloud => {
    const allWordsCloud = text
      .replace(HTML_TAGS_REG_EXP, " ")
      .match(WORDS_REG_EXP)
      .reduce<WordCloud>((set, item) => {
        if (!set[item]) {
          const nearestWords = checkWordInModel(item, 30);
          set[item] = {
            id: Object.keys(set).length,
            appearanceCount: 1,
            nearestWords,
          };
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
      .filter((i) => !Object.keys(numberCloud).includes(i))
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
      gameID: this._id,
      gameNumber: this.dayNumber,
      lastMovie: this.lastMovie.replace(/<\/?p>/g, ""),
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
  get gameModel() {
    return {
      _id: this._id,
      title: this.title,
      date: this.date,
      foundByIDs: this.foundByIDs,
      solutionPlainText: this.solutionPlainText,
      solution: this.solution,
      wordCloud: this.wordCloud,
      redactedTitle: this.redactedTitle,
      redactedSynopsis: this.redactedSynopsis,
    };
  }
}
