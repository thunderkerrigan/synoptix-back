import { Model } from "mongoose";

export interface ISimilarity {
  tuple: [string, string];
  score: number;
}
export interface ISimilarityDocument extends ISimilarity {
  // TODO: specific method on current object
  // setPassword: (password: string) => Promise<void>
  // checkPassword: (password: string) => Promise<boolean>
}
export interface ISimilarityModel extends Model<ISimilarityDocument> {
  findOneOrCreate: (
    tupleSimilarity: ISimilarity
  ) => Promise<ISimilarityDocument>;
  findOneWithTuple: (
    firstWord: string,
    secondWord: string
  ) => Promise<ISimilarityDocument | undefined>;
  findSimilarForTuples: (
    requestedWords: string,
    words: string[]
  ) => Promise<ISimilarityDocument[]>;
}
