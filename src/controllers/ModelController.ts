import path from "path";
import w2v, { Model } from "word2vec";
import { roundOff } from "../utils/number+utils";
let isModelLoaded = false;
let model: Model;

const loadModel = async (): Promise<Model> => {
  return new Promise((resolve, reject) => {
    console.log("loading model...");
    const modelPath = path.normalize(
      "./frWac_non_lem_no_postag_no_phrase_200_skip_cut100.bin"
    );
    w2v.loadModel(modelPath, (error, model) => {
      if (error) {
        reject(error);
      }
      console.log("model loaded");
      resolve(model);
    });
  });
};

export const startLoadingModel = async () => {
  isModelLoaded = true;
  model = await loadModel();
  isModelLoaded = false;
};

// startLoadingModel();
// loadDatabase();

export const checkWordInModel = (
  word: string,
  nearestWordCount = 20
): Record<string, number> => {
  const isANumber = !isNaN(parseFloat(word));
  const vector = model.getVector(word.toLocaleLowerCase());
  if (vector === null || isANumber) {
    return {};
  }
  const nearestWords = model.getNearestWords(vector, nearestWordCount);
  return nearestWords.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.word] = roundOff(cur.dist, 2);
    return acc;
  }, {});
};
