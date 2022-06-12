export interface ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;
}

export type WordCloud = Record<string, number>;

export interface GameWordCloud {
  allWordsCloud: WordCloud;
  singleLetterCloud: WordCloud;
  numberCloud: WordCloud;
  wordCloud: WordCloud;
}

export type ShadowWordsCloud = ShadowWord[][];
