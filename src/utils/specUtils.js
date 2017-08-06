const { Tokenizer, Stream, tokenParsers } = require('./../parser');

const { readFileSync } = require('fs');
const { resolve } = require('path');
const sources = {
  basic: readFileSync(resolve('walt/basic.walt'), 'utf8'),
  globals: readFileSync(resolve('walt/globals.walt'), 'utf8')
};

module.exports = {
  sources,
  tokenize: (text) => (new Tokenizer(new Stream(text), tokenParsers)).parse()
};

