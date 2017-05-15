const token = require('./../token');
const punctuation = require('./../punctuation');
const constant = require('./../constant');
const operator = require('./../operator');

const parse = char => {
  if (!punctuation(char) && !operator(char))
    return parse;
  return null;
}
const root = char => {
  if (operator(char) && !punctuation(char) && !constant(char))
    return parse;
  return null;
}

module.exports = token(parse, 'identifier');
