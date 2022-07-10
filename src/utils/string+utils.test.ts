import {
  makeHollowWord,
  clearingASCIISpaceFromText,
  clearingLinkFromText,
  clearingDivFromText,
} from "./string+utils";

describe("makeHollowWord", () => {
  const test: [string, string][] = [
    ["le", "  "],
    ["pour", "    "],
    ["table", "     "],
    ["l", " "],
    ["policier", "        "],
  ];
  it.each(test)("should make a hollow word", (word, expected) => {
    expect(makeHollowWord(word)).toBe(expected);
  });
});

describe("clearingASCIISpaceFromText", () => {
  it("should clear ASCII space from text", () => {
    const text = "Hello&#160;World<br />";
    const result = "Hello World ";
    expect(clearingASCIISpaceFromText(text)).toBe(result);
  });
});

describe("clearingLinkFromText", () => {
  const test: [string, string][] = [
    ['<a href="lol">le</a> text', "le text"],
    ['<a href="root">policier</a>', "policier"],
  ];
  it.each(test)("should clear link from text", (text, expected) => {
    expect(clearingLinkFromText(text)).toBe(expected);
  });
});

describe("clearingDivFromText", () => {
  const test: [string, string][] = [
    ['<span style="lol">le</span>', "le"],
    ['<div id="root">policier</div>', ""],
    ["policières <sup text>2</sup>", "policières "],
  ];
  it.each(test)("should clear div from text", (text, expected) => {
    expect(clearingDivFromText(text)).toBe(expected);
  });
});
