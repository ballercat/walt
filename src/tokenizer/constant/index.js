import token from "../token";
import Syntax from "../../Syntax";

const { isNaN, parseInt } = Number;
const isNumber = char => !isNaN(parseInt(char));
const isDot = char => char === ".";
const number = char => (isNumber(char) ? number : null);
const numberOrDot = char => {
  if (isDot(char)) return number;

  if (isNumber(char)) {
    return numberOrDot;
  }
  return null;
};

const root = char => {
  if (isDot(char)) return number;

  if (isNumber(char)) return numberOrDot;

  return null;
};

// TODO: split constants into literals String vs Numbers with Types
// TODO: figure out what above means??
export default token(root, Syntax.Constant);
