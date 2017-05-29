const token = require('./../token');
const punctuator = require('./../punctuator');
const constant = require('./../constant');

const parse = char => {
  if (!punctuator(char))
    return parse;
  return null;
}
const root = char => {
  if (!punctuator(char) && !constant(char))
    return parse;
  return null;
}

module.exports = token(parse, 'identifier');
