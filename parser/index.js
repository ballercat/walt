const Tokenizer = require('./Tokenizer');
const Stream = require('./Stream');
const keyword = require('./keyword');
const operator = require('./operator');
const punctuation = require('./punctuation');
const identifier = require('./identifier');

module.exports = {
  Tokenizer,
  Stream,
  keyword,
  operator,
  punctuation,
  identifier
};

