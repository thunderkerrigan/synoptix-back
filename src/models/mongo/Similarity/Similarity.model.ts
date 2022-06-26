import { model } from "mongoose";
import { ISimilarityDocument, ISimilarityModel } from "./Similarity.types";
import SimilaritySchema from "./Similarity.schema";

export const SimilarityModel = model<ISimilarityDocument, ISimilarityModel>(
  "Similarity",
  SimilaritySchema
);
