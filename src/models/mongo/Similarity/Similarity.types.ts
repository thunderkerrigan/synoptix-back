import { Model } from "mongoose";

export interface ISimilarity {
  tuple: { type: [String, String]; required: true };
  score: { type: number; required: true };
}
export interface ISimilarityDocument extends ISimilarity {
  // TODO: specific method on current object
  // setPassword: (password: string) => Promise<void>
  // checkPassword: (password: string) => Promise<boolean>
}
export interface ISimilarityModel extends Model<ISimilarityDocument> {
  // findByTheaterID: (theaterID: string) => Promise<ICPLDocument[]>
}
