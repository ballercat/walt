// @flow
import precedence from "./precedence";
import type { TokenType } from "../flow/types";

export const getPrecedence = (token: TokenType): number =>
  precedence[token.value];

export const getAssociativty = (token: TokenType): "left" | "right" => {
  switch (token.value) {
    case "=":
    case "-=":
    case "+=":
    case "--":
    case "++":
    case "?":
      return "right";
    case "+":
    case "-":
    case "/":
    case "*":
    case ":":
    default:
      return "left";
  }
};
