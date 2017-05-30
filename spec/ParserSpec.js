const Stream = require('./../parser/Stream');
const Tokenizer = require('./../parser/Tokenizer');
const TokenStream = require('./../parser/TokenStream');
const Parser = require('./../parser/Parser');
const { tokenParsers } = require('./../parser');
const nodeChecks = require('./nodeChecks');
const snapshot = require('snap-shot');

describe('Parser', () => {

  it('builds an AST from a Token Stream', () => {
    nodeChecks.declaration.map(decl => {
      const tokenizer = new Tokenizer(new Stream(decl), tokenParsers);
      const parser = new Parser(new TokenStream(tokenizer.parse()));

      snapshot(parser.parse());
    });
  });

  it('builds an AST for binary expressions', () => {
    const tokenizer = new Tokenizer(new Stream(nodeChecks.binary[0]), tokenParsers);
    const parser = new Parser(new TokenStream(tokenizer.parse()));

    snapshot(parser.parse());
  });
});

