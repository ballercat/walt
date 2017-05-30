const Context = require('./../parser/Context');

describe('Context', () => {
  it('can validate local declarations', () => {
    const ctx = new Context();
    ctx.isGlobal = false;
    ctx.locals = { foo: true };

    expect(() => {
      ctx.validateDeclaration({ id: 'foo', start: { line: 0, col: 0 } });
    }).toThrow();
  });
});

