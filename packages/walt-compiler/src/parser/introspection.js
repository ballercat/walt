// @flow
import precedence from "./precedence";
import type { Token } from "../flow/types";

export const getPrecedence = (token: Token): number => precedence[token.value];

export const getAssociativty = (token: Token): "left" | "right" => {
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
