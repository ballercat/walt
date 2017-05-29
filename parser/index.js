const Tokenizer = require('./Tokenizer');
const Stream = require('./Stream');
const keyword = require('./keyword');
const punctuator = require('./punctuator');
const identifier = require('./identifier');
const type = require('./type');
const constant = require('./constant');

module.exports = {
  Tokenizer,
  Stream,
  type,
  keyword,
  constant,
  punctuator,
  identifier,
  tokenParsers: [
    keyword, constant, punctuator, type, identifier
  ]
};

