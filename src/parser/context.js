const generateErrorString = (msg, error, line, col, filename, func) => {
  return `${error} ${msg}
    at ${func} (${filename}:${line}:${col})`;
}

/**
 * Context is used to parse tokens into an AST and IR used by the generator.
 * Originally the parser was a giant class and the context was the 'this' pointer.
 * Maintaining a monolithic parser is rather difficult so it was broken up into a
 * collection of self-contained parsers for each syntactic construct. The context
 * is passed around between each one to generate the desired tree
 */
class Context {
  constructor(options = {
    body: [],
    diAssoc: 'right',
    stream: null,
    token: null,
    globalSymbols: {},
    localSymbols: {},
    globals: [],
    functions: []
  }) {
    Object.assign(this, options);

    this.Program = { body: [] };
    // Setup keys needed for the emiter
    this.Program.Types = [];
    this.Program.Code = [];
    this.Program.Exports = [];
    this.Program.Imports = [];
    this.Program.Globals = [];
    this.Program.Functions = [];
  }

  syntaxError(msg, error) {
    const { line, col } = this.token.start;
    return new SyntaxError(
      generateErrorString(
        msg,
        error || '',
        line,
        col,
        this.filename || 'unknown',
        (this.func && this.func.id) || 'global'
      )
    );
  }

  unexpectedValue(value) {
    return this.syntaxError(
      `Value   : ${this.token.value}
      Expected: ${Array.isArray(value) ? value.join('|') : value}`,
      'Unexpected value'
    );
  }

  unexpected(token) {
    return this.syntaxError(
      'Unexpected token',
       `Token   : ${this.token.type}
        Expected: ${Array.isArray(token) ? token.join(' | ') : token}`
    );
  }

  unknown({ value }) {
    return this.syntaxError('Unknown token', value);
  }

  unsupported() {
    return this.syntaxError('Language feature not supported', this.token.value);
  }

  expect(value, type) {
    const token = this.token;
    if (!this.eat(value, type)) {
      throw value ? this.unexpectedValue(value) : this.unexpected(type);
    }

    return token;
  }

  next() {
    this.token = this.stream.next();
  }

  eat(value, type) {
    if (value) {
      if (value.includes(this.token.value)) {
        this.next();
        return true;
      }
      return false;
    }

    if (this.token.type === type) {
      this.next();
      return true;
    }

    return false;
  }

  startNode(token = this.token) {
    return { start: token.start, range: [token.start] };
  }

  endNode(node, Type) {
    const token = this.token || this.stream.last();
    return Object.assign(
      node,
      {
        Type,
        end: token.end,
        range: node.range.concat(token.end)
      });
  }
}

export default Context;

