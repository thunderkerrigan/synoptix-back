import { GameWordCloud, ShadowWord } from "../models/Word";
import { compareWordWithCloud } from "../utils/vectorComparator";
import { loadDatabase } from "../controllers/MongoController";
import { __TEST__GAME__ } from "../../.jest/game";

jest.setTimeout(10000);
describe("compare letter", () => {
  const _demoWordCloud = __TEST__GAME__.wordCloud;
  const test: [string, GameWordCloud, boolean][] = [
    ["l", _demoWordCloud, true],
    ["L", _demoWordCloud, true],
    ["c", _demoWordCloud, false],
    ["C", _demoWordCloud, false],
    ["s", _demoWordCloud, true],
    ["S", _demoWordCloud, true],
    ["t", _demoWordCloud, false],
    ["T", _demoWordCloud, false],
    ["a", _demoWordCloud, true],
    ["A", _demoWordCloud, true],
    ["à", _demoWordCloud, true],
    ["À", _demoWordCloud, true],
    ["y", _demoWordCloud, false],
    ["Y", _demoWordCloud, false],
    ["n", _demoWordCloud, true],
    ["N", _demoWordCloud, true],
  ];

  it.each(test)(
    "%s should match %s by base",
    async (requestedWord, demoWordCloud, expected) => {
      const { score } = await compareWordWithCloud(
        requestedWord,
        demoWordCloud,
        {}
      );
      const hasOneShadowWordWithSimilarityEqualsToOne = score.some(
        (s) => s.similarity === 1
      );
      expect(hasOneShadowWordWithSimilarityEqualsToOne).toBe(expected);
    }
  );
});

describe("compare number", () => {
  const _demoWordCloud = __TEST__GAME__.wordCloud;
  const test: [number, GameWordCloud, boolean, number][] = [
    [1000, _demoWordCloud, true, 0.5050505050505051],
    [990, _demoWordCloud, false, 0],
    [3920, _demoWordCloud, true, 0.5051020408163265],
    [3960, _demoWordCloud, false, 0],
    [5000, _demoWordCloud, false, 0],
    [2, _demoWordCloud, false, 0],
    [1980, _demoWordCloud, true, 1],
    [1985, _demoWordCloud, true, 0.9974811083123426],
    [1975, _demoWordCloud, true, 0.9974747474747475],
  ];

  it.each(test)(
    "%s should match %s by base",
    async (requestedWord, demoWordCloud, expected, value) => {
      const { score } = await compareWordWithCloud(
        requestedWord,
        demoWordCloud,
        {}
      );
      const hasOneShadowWordWithSimilarityEqualsToOne = score.length > 0;
      expect(hasOneShadowWordWithSimilarityEqualsToOne).toBe(expected);
      const similarity = score[0] ? score[0].similarity : 0;
      expect(similarity).toBe(value);
    }
  );
});
