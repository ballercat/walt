// @flow
import token from "../token";
import punctuator from "../punctuator";
import constant from "../constant";
import string from "../string";
import Syntax from "../../Syntax";

const supportAny = char => {
  if (!string(char) && !punctuator(char) && char !== " ") {
    return supportAny;
  }
  return null;
};

const parse = char => {
  // Don't allow these
  if (!string(char) && !punctuator(char) && !constant(char) && char !== " ") {
    return supportAny;
  }
  return null;
};
const tokenParser = token(parse, Syntax.Identifier);
export default tokenParser;
