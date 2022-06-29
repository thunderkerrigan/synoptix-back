import { GameWordCloud, ShadowWord } from "../models/Word";
import {
  compareWordWithCloud,
  loadDatabase,
  startLoadingModel,
} from "../utils/vectorComparator";
import { __TEST__GAME__ } from "../__tests__/constants/game";

beforeAll(async () => {
  await startLoadingModel();
  await loadDatabase();
});
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
  const test: [number, GameWordCloud, boolean][] = [
    [1000, _demoWordCloud, true],
    [990, _demoWordCloud, false],
    [3920, _demoWordCloud, true],
    [3960, _demoWordCloud, false],
    [5000, _demoWordCloud, false],
    [2, _demoWordCloud, false],
    [1980, _demoWordCloud, true],
  ];

  it.each(test)(
    "%s should match %s by base",
    async (requestedWord, demoWordCloud, expected) => {
      const { score } = await compareWordWithCloud(
        requestedWord,
        demoWordCloud,
        {}
      );
      const hasOneShadowWordWithSimilarityEqualsToOne = score.length > 0;
      expect(hasOneShadowWordWithSimilarityEqualsToOne).toBe(expected);
    }
  );
});
