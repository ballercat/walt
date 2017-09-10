import token from '../token';
import punctuator from '../punctuator';
import constant from '../constant';
import string from '../string';
import Syntax from '../../Syntax';

const parse = char => {
  if (!string(char) && !punctuator(char) && !constant(char))
    return parse;
  return null;
}
const tokenParser = token(parse, Syntax.Identifier);
export default tokenParser;

