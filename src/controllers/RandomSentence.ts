import {
  Adjective,
  determinants,
  getRandomAdjective,
  getRandomNoun,
  Noun,
} from "@autheur/datasets";
import { isFirstCharAVowelOrAnH } from "@autheur/operators";

export const makeRandomSentence = (gender: "m" | "f" | "p"): string => {
  const firstAdjective = getRandomAdjective();
  let name = getRandomNoun();
  const secondAdjective = getRandomAdjective();
  while (gender !== "p" && name.gender !== gender) {
    name = getRandomNoun();
  }
  const [definitiveFirstAdjective, definitiveSecondAdjective] = orderAdjective(
    firstAdjective,
    secondAdjective
  );
  switch (gender) {
    case "m":
      return `${getDeterminant(
        name,
        definitiveFirstAdjective.masculinSingular
      )}${definitiveFirstAdjective.masculinSingular} ${name.singular} ${
        definitiveSecondAdjective.masculinSingular
      }`;
    case "f":
      return `${getDeterminant(
        name,
        definitiveFirstAdjective.femininSingular
      )}${definitiveFirstAdjective.femininSingular} ${name.singular} ${
        definitiveSecondAdjective.femininSingular
      }`;
    case "p":
      switch (name.gender) {
        case "m":
          return `${determinants.defined.plural.default.pop()} ${
            definitiveFirstAdjective.masculinPlural
          } ${name.plural} ${definitiveSecondAdjective.masculinPlural}`;
        case "f":
          return `${determinants.defined.plural.default.pop()} ${
            definitiveFirstAdjective.femininPlural
          } ${name.plural} ${definitiveSecondAdjective.femininPlural}`;
      }
  }
};

const getDeterminant = (word: Noun, accordWord: string): string => {
  switch (word.gender) {
    case "f":
      return isFirstCharAVowelOrAnH(accordWord)
        ? `${determinants.defined.feminin.withVowel.pop()}`
        : `${determinants.defined.feminin.withoutVowel.pop()} `;
    case "m":
      return isFirstCharAVowelOrAnH(accordWord)
        ? `${determinants.defined.masculin.withVowel.pop()}`
        : `${determinants.defined.masculin.withoutVowel.pop()} `;
    case "u":
      return "";
  }
};

const orderAdjective = (
  first: Adjective,
  second: Adjective
): [Adjective, Adjective] => {
  if (
    first.masculinSingular.charCodeAt(0) < second.masculinSingular.charCodeAt(0)
  ) {
    return [first, second];
  }
  return [second, first];
};
