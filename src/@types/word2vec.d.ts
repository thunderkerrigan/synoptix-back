declare module "word2vec" {
  export interface Model {
    analogy: typeof Analogy;
    getNearestWord: typeof GetNearestWord;
    getNearestWords: typeof GetNearestWords;
    getVector: typeof GetVector;
    getVectors: typeof GetVectors;
    mostSimilar: typeof MostSimilar;
    similarity: typeof Similarity;
    words: number;
    size: number;
  }

  export interface WordDistance {
    word: string;
    dist: number;
  }
  export interface WordVector {
    word: string;
    values: number[];
    add: (wordVector) => void;
    subtract: (wordVector) => void;
  }

  export function loadModel(
    file: path,
    callback: (error: Error, model: Model) => void
  ): void;

  function Similarity(word1: string, word2: string): number;
  function MostSimilar(phrase: string, number?: number): WordDistance[];
  function GetVector(word: string): WordVector;
  function GetVectors(words: string[]): WordVector[];
  function GetNearestWord(vector: WordVector): WordDistance;
  function GetNearestWords(vector: WordVector, number?: number): WordDistance[];
  function Analogy(
    word: string,
    pair: [string, string],
    number?: number
  ): WordDistance[];
}
