// @flow
import token from '../token';
import Syntax from 'walt-syntax';

const quoteOK = quoteCheck => () => quoteCheck;
const nextFails = () => null;

const endsInSingleQuote = char => {
  if (/\\/.test(char)) {
    return quoteOK(endsInSingleQuote);
  }
  if (char === "'") {
    return nextFails;
  }

  return endsInSingleQuote;
};

const endsInDoubleQuote = char => {
  if (/\\/.test(char)) {
    return quoteOK(endsInDoubleQuote);
  }
  if (char === '"' || char === '`') {
    return nextFails;
  }

  return endsInDoubleQuote;
};

const maybeQuote = char => {
  if (char === "'") {
    return endsInSingleQuote;
  }
  if (char === '"' || char === '`') {
    return endsInDoubleQuote;
  }

  return null;
};

const stringParser = token(maybeQuote, Syntax.StringLiteral);
export default stringParser;
