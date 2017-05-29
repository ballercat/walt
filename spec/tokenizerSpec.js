const snapshot = require('snap-shot');
const {
  Tokenizer,
  Stream,
  type,
  keyword,
  constant,
  punctuator,
  identifier,
  tokenParsers
} = require('./../parser');
const Syntax = require('./../parser/Syntax');
const { sources } = require('./specUtils');

describe('Tokenizer', () => {
  it('must be initialized with a Stream object', () => {
    expect(() => new Tokenizer()).toThrow();
  });

  describe('next', () => {
    let tokenizer;
    it('reads tokens, ignoring whitespace', () => {
      const tokenizer = new Tokenizer(new Stream('     global'), tokenParsers);
      expect(tokenizer.next()).toEqual({
        type: Syntax.Keyword,
        value: 'global',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });
    });

    it('matches a keyword value with keyword type', () => {
      keyword.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({
          type: Syntax.Keyword,
          value,
          start: jasmine.any(Object),
          end: jasmine.any(Object)
        });
      });
    });

    it('matches an puntuator value with punctuator type', () => {
      punctuator.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({
          type: Syntax.Punctuator,
          value,
          start: jasmine.any(Object),
          end: jasmine.any(Object)
        });
      });
    });

    it('matches type values with type type', () => {
      type.supported.map(value => {
        const tokenizer = new Tokenizer(new Stream(value), tokenParsers);
        const token = tokenizer.next();
        expect(token).toEqual({
          type: Syntax.Type,
          value,
          start: jasmine.any(Object),
          end: jasmine.any(Object)
        });
      });
    });

    it('matches other values to identifiers', () => {
      const tokenizer = new Tokenizer(new Stream('foobar'), tokenParsers);
      expect(tokenizer.next()).toEqual({
        type: Syntax.Identifier,
        value: 'foobar',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });

      tokenizer.stream = new Stream('a');
      expect(tokenizer.next()).toEqual({
        type: Syntax.Identifier,
        value: 'a',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });
    });

    it('matches constant value to constant type', () => {
      const tokenizer = new Tokenizer(new Stream('-2'), tokenParsers);
      expect(tokenizer.next()).toEqual({
        type: Syntax.Constant,
        value: '-2',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });
      tokenizer.stream = new Stream('+2');
      expect(tokenizer.next()).toEqual({
        type: Syntax.Constant,
        value: '+2',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });

      tokenizer.stream = new Stream('0.2');
      expect(tokenizer.next()).toEqual({
        type: Syntax.Constant,
        value: '0.2',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });

      tokenizer.stream = new Stream('.2');
      expect(tokenizer.next()).toEqual({
        type: Syntax.Constant,
        value: '.2',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });

      tokenizer.stream = new Stream('-0.2');
      expect(tokenizer.next()).toEqual({
        type: Syntax.Constant,
        value: '-0.2',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });
    });

    it('matches identifiers with keyword roots as identifiers', () => {
      const tokenizer = new Tokenizer(new Stream('sizeoffoobar'), tokenParsers);
      expect(tokenizer.next()).toEqual({
        type: Syntax.Identifier,
        value: 'sizeoffoobar',
        start: jasmine.any(Object),
        end: jasmine.any(Object)
      });
    });
  });

  describe('parse', () => {
    let tokenizer;
    beforeEach(() => {
      tokenizer = new Tokenizer(new Stream(sources.globals), tokenParsers)
    });

    it('parses a stream into tokens', () => {
      const result = tokenizer.parse();
      snapshot(result);
    });
  });
});

