const snapshot = require('snap-shot');
const {
  Tokenizer,
  Stream,
  type,
  keyword,
  operator,
  constant,
  punctuation,
  identifier,
  tokenParsers
} = require('./../parser');
const { sources } = require('./specUtils');

describe('Tokenizer', () => {
  it('must be initialized with a Stream object', () => {
    expect(() => new Tokenizer()).toThrow();
  });

  describe('next', () => {
    let tokenizer;
    it('reads tokens, ignoring whitespace', () => {
      const tokenizer = new Tokenizer(new Stream('     global'), tokenParsers);
      expect(tokenizer.next()).toEqual({ type: 'keyword', value: 'global' });
    });

    it('matches a keyword value with keyword type', () => {
      keyword.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({ type: keyword.type, value });
      });
    });

    it('matches an operator value with operator type', () => {
      operator.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({ type: operator.type, value });
      });
    });

    it('matches punctuation value with punctuation type', () => {
      punctuation.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({ type: punctuation.type, value });
      });
    });

    it('matches type values with type type', () => {
      type.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({ type: type.type, value });
      });
    });

    it('matches other values to identifiers', () => {
      const tokenizer = new Tokenizer(new Stream('foobar'), tokenParsers);
      expect(tokenizer.next()).toEqual({ type: identifier.type, value: 'foobar' });

      tokenizer.stream = new Stream('a');
      expect(tokenizer.next()).toEqual({ type: identifier.type, value: 'a' });
    });

    it('matches constant value to contant type', () => {
      const tokenizer = new Tokenizer(new Stream('-2'), tokenParsers);
      expect(tokenizer.next()).toEqual({ type: constant.type, value: '-2' });
      tokenizer.stream = new Stream('+2');
      expect(tokenizer.next()).toEqual({ type: constant.type, value: '+2' });

      tokenizer.stream = new Stream('0.2');
      expect(tokenizer.next()).toEqual({ type: constant.type, value: '0.2' });

      tokenizer.stream = new Stream('.2');
      expect(tokenizer.next()).toEqual({ type: constant.type, value: '.2' });

      tokenizer.stream = new Stream('-0.2');
      expect(tokenizer.next()).toEqual({ type: constant.type, value: '-0.2' });
    });

    it('matches identifiers with keyword roots as identifiers', () => {
      const tokenizer = new Tokenizer(new Stream('sizeoffoobar'), tokenParsers);
      expect(tokenizer.next()).toEqual({ type: identifier.type, value: 'sizeoffoobar' });
    });

    it('matches semi-colon after keyword', () => {
      const tokenizer = new Tokenizer(new Stream('sizeof;'), tokenParsers);
      expect(tokenizer.next()).toEqual({ type: keyword.type, value: 'sizeof' });
      expect(tokenizer.next()).toEqual({ type: punctuation.type, value: ';' });
    });
  });

  describe('parse', () => {
    let tokenizer;
    beforeEach(() => {
      tokenizer = new Tokenizer(new Stream(sources.globals), tokenParsers)
    });

    it('can handle expressions without spaces', () => {
    });

    it('parses a stream into tokens', () => {
      const result = tokenizer.parse();
      snapshot(result);
    });
  });
});

