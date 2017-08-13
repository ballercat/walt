const { Tokenizer, Stream, tokenParsers } = require('./../parser');

const { readFileSync } = require('fs');
const { resolve } = require('path');

module.exports = {
  tokenize: (text) => (new Tokenizer(new Stream(text), tokenParsers)).parse()
};

