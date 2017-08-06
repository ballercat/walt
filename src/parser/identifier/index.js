const token = require('./../token');
const punctuator = require('./../punctuator');
const constant = require('./../constant');
const Syntax = require('./../Syntax');

const parse = char => {
  if (!punctuator(char) && !constant(char))
    return parse;
  return null;
}

module.exports = token(parse, Syntax.Identifier);
