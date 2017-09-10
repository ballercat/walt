import token from '../token';
import Syntax from '../../Syntax';

const quoteOK = quoteCheck => char => quoteCheck;
const nextFails = () => null;

const endsInSingleQuote = char => {
  if (char === '\\')
    return quoteOK(endsInSingleQuote);
  if (char === '\'')
    return nextFails;

  return endsInSingleQuote;
}

const endsInDoubleQuote = char => {
  if (char === '\\')
    return quoteOK(endsInDoubleQuote);
  if (char === '"')
    return nextFails;

  return endsInDoubleQuote;
}

const maybeQuote = char => {
  if (char === '\'')
    return endsInSingleQuote;
  if (char === '"')
    return endsInDoubleQuote;

  return null;
}

const stringParser = token(maybeQuote, Syntax.StringLiteral);
export default stringParser;

