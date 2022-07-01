export const roundOff = (num: number, places: number) => {
  const x = Math.pow(10, places);
  return Math.round(num * x) / x;
};

export const randomWithRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
