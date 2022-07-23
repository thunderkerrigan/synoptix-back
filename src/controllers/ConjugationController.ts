import { conjugate } from "conjugation-fr";

export const getAllFormsForVerb = (verb: string): string[] => {
  try {
    // infinitive
    const infinitive = conjugate(verb, "infinitive", "infinitive-present");
    // indicative
    const present = conjugate(verb, "indicative", "present");
    const present_f = conjugate(verb, "indicative", "present", true);
    const imperfect = conjugate(verb, "indicative", "imperfect");
    const imperfect_f = conjugate(verb, "indicative", "imperfect", true);
    const future = conjugate(verb, "indicative", "future");
    const future_f = conjugate(verb, "indicative", "future", true);
    const simplePast = conjugate(verb, "indicative", "simple-past");
    const simplePast_f = conjugate(verb, "indicative", "simple-past", true);
    const perfect = conjugate(verb, "indicative", "perfect-tense");
    const perfect_f = conjugate(verb, "indicative", "perfect-tense", true);
    const pluperfect = conjugate(verb, "indicative", "pluperfect");
    const pluperfect_f = conjugate(verb, "indicative", "pluperfect", true);
    const anteriorPast = conjugate(verb, "indicative", "anterior-past");
    const anteriorPast_f = conjugate(verb, "indicative", "anterior-past", true);
    const anteriorFuture = conjugate(verb, "indicative", "anterior-future");
    const anteriorFuture_f = conjugate(
      verb,
      "indicative",
      "anterior-future",
      true
    );
    const allIndicative = [
      ...present,
      ...present_f,
      ...imperfect,
      ...imperfect_f,
      ...future,
      ...future_f,
      ...simplePast,
      ...simplePast_f,
      ...perfect,
      ...perfect_f,
      ...pluperfect,
      ...pluperfect_f,
      ...anteriorPast,
      ...anteriorPast_f,
      ...anteriorFuture,
      ...anteriorFuture_f,
    ];
    // conditional
    const conditionalPresent = conjugate(verb, "conditional", "present");
    const conditionalPresent_f = conjugate(
      verb,
      "conditional",
      "present",
      true
    );
    const conditionalPast = conjugate(verb, "conditional", "conditional-past");
    const conditionalPast_f = conjugate(
      verb,
      "conditional",
      "conditional-past",
      true
    );
    const allConditional = [
      ...conditionalPresent,
      ...conditionalPresent_f,
      ...conditionalPast,
      ...conditionalPast_f,
    ];
    // subjonctive
    const subjunctivePresent = conjugate(verb, "subjunctive", "present");
    const subjunctivePresent_f = conjugate(
      verb,
      "subjunctive",
      "present",
      true
    );
    const subjunctiveImperfect = conjugate(verb, "subjunctive", "imperfect");
    const subjunctiveImperfect_f = conjugate(
      verb,
      "subjunctive",
      "imperfect",
      true
    );
    const subjunctivePast = conjugate(verb, "subjunctive", "subjunctive-past");
    const subjunctivePast_f = conjugate(
      verb,
      "subjunctive",
      "subjunctive-past",
      true
    );
    const subjunctivePluperfect = conjugate(
      verb,
      "subjunctive",
      "subjunctive-pluperfect",
      true
    );
    const subjunctivePluperfect_f = conjugate(
      verb,
      "subjunctive",
      "subjunctive-pluperfect",
      true
    );
    const allSubjunctive = [
      ...subjunctivePresent,
      ...subjunctivePresent_f,
      ...subjunctiveImperfect,
      ...subjunctiveImperfect_f,
      ...subjunctivePast,
      ...subjunctivePast_f,
      ...subjunctivePluperfect,
      ...subjunctivePluperfect_f,
    ];
    // imperative
    const imperativePresent = conjugate(
      verb,
      "imperative",
      "imperative-present"
    );
    const imperativePresent_f = conjugate(
      verb,
      "imperative",
      "imperative-present",
      true
    );
    const imperativePast = conjugate(verb, "imperative", "imperative-past");
    const imperativePast_f = conjugate(
      verb,
      "imperative",
      "imperative-past",
      true
    );

    const allImperative = [
      ...imperativePresent,
      ...imperativePresent_f,
      ...imperativePast,
      ...imperativePast_f,
    ];
    // participle
    const participlePresent = conjugate(
      verb,
      "participle",
      "present-participle"
    );
    const participlePresent_f = conjugate(
      verb,
      "participle",
      "present-participle",
      true
    );
    const participlePast = conjugate(verb, "participle", "past-participle");
    const participlePast_f = conjugate(
      verb,
      "participle",
      "past-participle",
      true
    );
    const allParticiple = [
      ...participlePresent,
      ...participlePresent_f,
      ...participlePast,
      ...participlePast_f,
    ];
    const rawForms = [
      ...infinitive,
      ...allIndicative,
      ...allConditional,
      ...allSubjunctive,
      ...allImperative,
      ...allParticiple,
    ];

    const forms = rawForms.reduce<string[]>((acc, { verb }) => {
      const splittedWord = verb.split(" ");
      const lastWord = splittedWord.pop();
      if (lastWord && !acc.includes(lastWord)) {
        return [...acc, lastWord];
      }
      return acc;
    }, []);
    return forms;
  } catch (error) {
    return [];
  }
};
