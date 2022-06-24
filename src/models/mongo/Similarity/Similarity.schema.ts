import { Schema } from "mongoose";
import { ISimilarityDocument } from "./Similarity.types";

const SimilaritySchema = new Schema<ISimilarityDocument>({
  tuple: { type: [String, String], required: true },
  score: { type: Number, required: true },
});

export default SimilaritySchema;
