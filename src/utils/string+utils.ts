import {
  HTML_LINK_CONTENT_REG_EXP,
  UNWANTED_HTML_CONTENT_REG_EXP,
} from "./Regexp";

export const makeHollowWord = (word: string): string => {
  let hollow = "";
  for (let i = 0; i < word.length; i++) {
    hollow += " ";
  }
  return hollow;
};

export const clearingLinkFromText = (text: string) =>
  text.replace(HTML_LINK_CONTENT_REG_EXP, "");

export const clearingDivFromText = (text: string) =>
  text.replace(UNWANTED_HTML_CONTENT_REG_EXP, "");
