import w2v, { Model } from "word2vec";
import { ShadowWord, Word } from "../models/Word";
import { makeHollowWord } from "./string+utils";
let isLoading = false;
let model: Model;
const loadModel = async (): Promise<Model> => {
  return new Promise((resolve, reject) => {
    // console.log("loading model...");
    console.log("loading model...");
    // w2v.loadModel("./GoogleNews-vectors-negative300.bin", (error, model) => {
    w2v.loadModel(
      "./frWiki_no_phrase_no_postag_700_cbow_cut100.bin",
      // "./frWac_non_lem_no_postag_no_phrase_200_cbow_cut0.bin",
      // "/home/thunder/Projects/synoptix/synoptix-back/GoogleNews-vectors-negative300.bin",
      // "/home/thunder/Projects/synoptix/synoptix-back/enwik9",
      // "./frWac_no_postag_no_phrase_700_skip_cut50.bin",
      //   "./frWiki_no_lem_no_postag_no_phrase_1000_skip_cut200.bin",
      // "./frWiki_no_phrase_no_postag_700_cbow_cut100.bin",
      // "./frWac_non_lem_no_postag_no_phrase_200_cbow_cut0.bin",
      // "./frwiki-20181020.treetag.2.ngram-pass2__2019-04-08_09.02__.s500_w5_skip.word2vec.bin",
      // "./frwiki-20181020.treetag.2__2019-01-24_10.41__.s500_w5_skip.word2vec.bin",
      (error, model) => {
        if (error) {
          reject(error);
        }
        console.log("model loaded");
        resolve(model);
      }
    );
  });
};

const startLoadingModel = async () => {
  isLoading = true;
  model = await loadModel();
  isLoading = false;
};

startLoadingModel();

export const compareWordWithCloud = async (
  requestedWord: string,
  cloud: Word
): Promise<ShadowWord[]> => {
  if (!model && !isLoading) {
    await startLoadingModel();
  }
  return Object.keys(cloud)
    .map<ShadowWord>((comparedWord: string, index): ShadowWord => {
      const requestedWordLowerCased = requestedWord.toLocaleLowerCase();
      const comparedWordLowerCased = comparedWord.toLocaleLowerCase();
      if (comparedWordLowerCased === requestedWordLowerCased) {
        return {
          id: cloud[comparedWord],
          closestWord: comparedWord,
          shadowWord: makeHollowWord(comparedWord),
          similarity: 1,
        };
      }
      const similarity = model.similarity(
        requestedWordLowerCased,
        comparedWordLowerCased
      );
      //   console.log(requestedWord, " : ", comparedWord, "-->", similarity);

      return {
        id: cloud[comparedWord],
        closestWord: similarity === 1 ? comparedWord : requestedWord,
        shadowWord: makeHollowWord(comparedWord),
        similarity,
      };
    })
    .filter((w) => w.similarity > 0.3);
};
