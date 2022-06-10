export interface ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;
}

export type Word = Record<string, number>;

  export type ShadowWordsCloud = ShadowWord[][]