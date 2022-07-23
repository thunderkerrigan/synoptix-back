import { getAllFormsForVerb } from "./ConjugationController";

const ALLER_FORMS = [
  "aller",
  "allant",
  "allé",
  "allée",
  "allées",
  "vais",
  "vas",
  "va",
  "allons",
  "allez",
  "vont",
  "allés",
  "allais",
  "allait",
  "allions",
  "alliez",
  "allaient",
  "allai",
  "allas",
  "alla",
  "allâmes",
  "allâtes",
  "allèrent",
  "irai",
  "iras",
  "ira",
  "irons",
  "irez",
  "iront",
  "aille",
  "ailles",
  "aillent",
  "allasse",
  "allasses",
  "allât",
  "allassions",
  "allassiez",
  "allassent",
  "irais",
  "irait",
  "irions",
  "iriez",
  "iraient",
];

describe("getAllFormsForVerb", () => {
  it("should return all forms for a verb", () => {
    const result = getAllFormsForVerb("aller");
    expect(result.sort()).toStrictEqual(ALLER_FORMS.sort());
  });
  it("should return empty for non verbal word", () => {
    const result = getAllFormsForVerb("pirouette");
    expect(result.sort()).toStrictEqual([]);
  });
});
