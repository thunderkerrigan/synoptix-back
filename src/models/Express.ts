import { Send } from "express-serve-static-core";
import { ShadowWord, ShadowWordsCloud } from "./Word";

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}
export interface TypedResponse<T> extends Express.Response {
  send: Send<T, this>;
}

export interface ScoreResponse {
  score: ShadowWord[];
  foundBy: number;
  response?: ShadowWordsCloud;
}
export interface RequestWinResponse {
  foundPosition: number;
  response?: ShadowWordsCloud;
}
