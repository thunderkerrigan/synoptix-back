import { roundOff, randomWithRange } from "./number+utils";

describe("test roundOff", () => {
  it("should round off to 2 decimal places", () => {
    expect(roundOff(1.2345, 2)).toBe(1.23);
  });
});

describe("test randomWithRange", () => {
  const testArray: { min: number; max: number }[] = [
    { min: 0, max: 10 },
    { min: 1, max: 23 },
    { min: 23, max: 300 },
    { min: 124, max: 10242142 },
  ];
  it.each(testArray)(
    "should return a random number between min and max",
    (range) => {
      const array = new Array(200).fill(randomWithRange(range.min, range.max));
      expect(array.length).toBe(200);
      expect(array.every((x) => x >= range.min && x <= range.max)).toBe(true);
    }
  );
});
