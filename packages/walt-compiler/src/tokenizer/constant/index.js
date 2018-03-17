// @flow
import token from "../token";
import Syntax from "../../Syntax";

const { isNaN, parseInt } = Number;
export const isNumber = (char: string) => !isNaN(parseInt(char));
const isDot = char => char === ".";
const number = char => (isNumber(char) ? number : null);

const numberOrDot = char => {
  if (isDot(char)) {
    return number;
  }

  if (isNumber(char)) {
    return numberOrDot;
  }
  return null;
};

const hex = char => {
  if (/[0-9a-fA-F]/.test(char)) {
    return hex;
  }

  return null;
};

const maybeExponent = char => {
  switch (char) {
    case "e":
    case "E":
      return number;
    default:
      return numberOrDot(char);
  }
};
const maybeModifier = char => {
  switch (char) {
    case "b":
    case "B":
      return number;
    case "o":
      return number;
    case "x":
    case "X":
      return hex;
    default:
      return numberOrDot(char);
  }
};

const root = char => {
  if (isDot(char)) {
    return number;
  } else if (char === "0") {
    return maybeModifier;
  } else if (isNumber(char)) {
    return maybeExponent;
  }

  return null;
};

export default token(root, Syntax.Constant);
