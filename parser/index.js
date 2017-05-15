const Tokenizer = require('./Tokenizer');
const Stream = require('./Stream');
const keyword = require('./keyword');
const operator = require('./operator');
const punctuation = require('./punctuation');
const identifier = require('./identifier');
const type = require('./type');
const constant = require('./constant');

module.exports = {
  Tokenizer,
  Stream,
  type,
  keyword,
  operator,
  constant,
  punctuation,
  identifier,
  tokenParsers: [
    keyword, constant, operator, punctuation, type, identifier
  ]
};

