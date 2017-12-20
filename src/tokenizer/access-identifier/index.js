// @flow

import token from "../token";
import Syntax from "../../Syntax";
import { maybeIdentifier } from "../identifier";

const maybeAccessIdentifier = char => {
  if (char === ".") {
    return maybeIdentifier;
  }
  return null;
};

export default token(maybeAccessIdentifier, Syntax.AccessIdentifier);
