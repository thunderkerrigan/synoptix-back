import { makeRandomSentence } from "./RandomSentence";

describe("RandomSentence", () => {
  it("should return a random male sentence", () => {
    const randomSentence = makeRandomSentence("m");
    console.log(randomSentence);
    expect(randomSentence).toBeDefined();
  });
  it("should return a random female sentence", () => {
    const randomSentence = makeRandomSentence("f");
    console.log(randomSentence);
    expect(randomSentence).toBeDefined();
  });
  it("should return a random plural sentence", () => {
    const randomSentence = makeRandomSentence("p");
    console.log(randomSentence);
    expect(randomSentence).toBeDefined();
  });
});
