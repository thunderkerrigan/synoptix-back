export const makeHollowWord = (word: string): string => {
    let hollow = "";
    for (let i = 0; i < word.length; i++) {
      hollow += " ";
    }
    return hollow;
  };