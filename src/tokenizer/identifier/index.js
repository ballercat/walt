import token from "../token";
import punctuator from "../punctuator";
import constant from "../constant";
import string from "../string";
import Syntax from "../../Syntax";

const maybeIdentifier = char => {
  // Don't allow these
  if (!string(char) && !punctuator(char) && !constant(char) && char !== " ") {
    return maybeIdentifier;
  }
  return null;
};

export default token(maybeIdentifier, Syntax.Identifier);
