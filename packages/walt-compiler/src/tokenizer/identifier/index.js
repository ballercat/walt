// @flow
import token from '../token';
import punctuator from '../punctuator';
import constant from '../constant';
import string from '../string';
import Syntax from '../../Syntax';
import { eol } from '../../utils/stream';

const isValidIdentifier = char => {
  // Don't allow these
  return !string(char) && !punctuator(char) && !eol(char) && char !== ' ';
};

const supportAny = char => {
  return isValidIdentifier(char) ? supportAny : null;
};

const parse = char => {
  return isValidIdentifier(char) && !constant(char) ? supportAny : null;
};
const tokenParser = token(parse, Syntax.Identifier);
export default tokenParser;
