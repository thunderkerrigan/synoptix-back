import { Schema } from "mongoose";
import { ISimilarity, ISimilarityDocument } from "./Similarity.types";

const SimilaritySchema = new Schema<ISimilarityDocument>({
  tuple: { type: [String, String], required: true },
  score: { type: Number, required: true },
});

SimilaritySchema.statics.findSimilarForTuples = async function (
  requestedWord: string,
  words: string[]
): Promise<ISimilarityDocument[]> {
  // {$and:[{tuple: {$in:["la"]}},{tuple: {$in:["long", "tranquille"]}}]}
  return await this.find({
    $and: [{ tuple: { $in: [requestedWord] } }, { tuple: { $in: words } }],
  }).lean();
};
SimilaritySchema.statics.findOneWithTuple = async function (
  firstWord: string,
  secondWord: string
): Promise<ISimilarityDocument | undefined> {
  return await this.findOne({
    $and: [{ tuple: { $in: [firstWord] } }, { tuple: { $in: [secondWord] } }],
  }).lean();
};
SimilaritySchema.statics.findOneOrCreate = async function (
  tupleSimilarity: ISimilarity
): Promise<ISimilarityDocument> {
  try {
    const existing = await this.findOne({
      $and: [
        { tuple: { $in: [tupleSimilarity.tuple[0]] } },
        { tuple: { $in: [tupleSimilarity.tuple[1]] } },
      ],
    }).lean();

    return existing || (await this.create(tupleSimilarity));
  } catch (error) {
    // TODO: handle error
  }
};

export default SimilaritySchema;
