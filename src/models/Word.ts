export interface ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;
}

export type WordCloud = Record<string, { id: number; appearanceCount: number }>;

export interface GameWordCloud {
  allWordsCloud: WordCloud;
  singleLetterCloud: WordCloud;
  numberCloud: WordCloud;
  wordCloud: WordCloud;
}

export interface WikipediaMovie {
  id: number;
  title: string;
  synopsis: string;
}

export type ShadowWordsCloud = ShadowWord[][];
