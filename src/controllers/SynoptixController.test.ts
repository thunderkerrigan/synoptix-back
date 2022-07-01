import { findAllFormsForWord } from "./SynoptixController";
import { loadDatabase } from "./MongoController";

beforeAll(async () => {
  await loadDatabase();
});

describe("Words matcher", () => {
  const test: [string, string[]][] = [
    ["le", ["le", "la", "les", "l"]],
    ["la", ["la", "le", "les", "l"]],
    ["les", ["la", "le", "les", "l"]],
    ["l", ["la", "le", "les", "l"]],
    // ["policier", ["policier", "policiers", "policières", "policière"]],
    // ["policières", ["policier", "policiers", "policières", "policière"]],
  ];
  it.each(test)(
    "should find all form for a word",
    async (requestedWord, expected) => {
      const forms = await findAllFormsForWord(requestedWord);
      expect(forms.sort()).toStrictEqual(expected.sort());
    }
  );
});
