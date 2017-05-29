const Stream = require('./../parser/Stream');
const Tokenizer = require('./../parser/Tokenizer');
const TokenStream = require('./../parser/TokenStream');
const Parser = require('./../parser/Parser');
const { tokenParsers } = require('./../parser');
const nodeChecks = require('./nodeChecks');
const snapshot = require('snap-shot');

describe('Parser', () => {

  it('builds an AST from a Token Stream', () => {
    const decl = nodeChecks.declaration[0];
    const tokenizer = new Tokenizer(new Stream(decl), tokenParsers);
    const parser = new Parser(new TokenStream(tokenizer.parse()));

    // console.log(parser.parse());
    snapshot(parser.parse());
  });
});

