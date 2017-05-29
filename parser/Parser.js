const { identity: I } = require('ramda');

class Parser {
  constructor(walker) {
    this.walker = walker;
    this.current = walker.next();
  }

  eat(type) {
    if (this.current.type === type)
      this.current = this.walker.next();
    else
      throw new Error('Syntax error');
  }

  function() {
  }

  epxression() {

  }

  program() {
    const node = { type: 'program', body: [] };

    while (this.current) {
      const child = this.expression();
      if (child)
        node.body.push(child);
    }
  }

  parse() {
    return this.program();
  }
}

module.exports = Parser;

