export interface ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;
}

export interface LastWord {
  index: number;
  label: string;
  matchCount: number;
  nearCount: number;
}

export type WordCloud = Record<
  string,
  {
    id: number;
    appearanceCount: number;
    nearestWords: Record<string, number>;
  }
>;

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
  untreatedSynopsis: string;
}

export type ShadowWordsCloud = ShadowWord[][];

export type WordType =
  | "Adverbe"
  | "Adjectif"
  | "Locution"
  | "Nom commun"
  | "Nom propre"
  | "Préposition"
  | "Pronom"
  | "Verbe";
