const snapshot = require('snap-shot');
const {
  Tokenizer,
  Stream,
  keyword,
  operator,
  punctuation,
  identifier
} = require('./../parser');
const { sources } = require('./specUtils');
const expected = [
  { type: 'keyword', value: 'global' },
  { type: 'type', value: 'i32' },
  { type: 'identifier', value: 'a' },
  { type: 'operator', value: '=' },
  { type: 'constant', value: '-2' },
  { type: 'punctuation', value: ';' }
];

describe('Tokenizer', () => {
  it('must be initialized with a Stream object', () => {
    expect(() => new Tokenizer()).toThrow();
  });

  it('tokenizes global expressions', () => {
    const source = 'global i32 a = -2;';

    snapshot(expected);
  });

  describe('next', () => {
    it('reads tokens, ignoring whitespace', () => {
      const tokenizer = new Tokenizer(new Stream('     global'));
      expect(tokenizer.next()).toEqual({ type: 'keyword', value: 'global' });
    });
  });

  describe('token', () => {
    let tokenizer;
    beforeEach(() => {
      tokenizer = new Tokenizer(new Stream(''));
    });

    it('matches a keyword value with keyword type', () => {
      keyword.supported.map(value => {
        const token = tokenizer.token(value);
        expect(token).toEqual({ type: keyword.type, value });
      });
    });

    it('matches an operator value with operator type', () => {
      operator.supported.map(value => {
        const token = tokenizer.token(value);
        expect(token).toEqual({ type: operator.type, value });
      });
    });

    it('matches punctuation value with punctuation type', () => {
      punctuation.supported.map(value => {
        const token = tokenizer.token(value);
        expect(token).toEqual({ type: punctuation.type, value });
      });
    });

    it('matches other values to identifiers', () => {
      const value = 'foobar';
      const token = tokenizer.token(value);
      expect(token).toEqual({ type: identifier.type, value });
    });
  });

});

