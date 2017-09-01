import statement from './statement';
import Context from './context';

class Parser {
  constructor(stream, context = new Context({
    body: [],
    diAssoc: 'right',
    stream: stream,
    token: stream.next(),
    globalSymbols: {},
    localSymbols: {},
    globals: [],
    functions: []
  })) {
    this.context = context;
  }
  // Get the ast
  parse() {
    const ctx = this.context;
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!ctx.stream || !ctx.stream.length) {
      return {};
    }

    const node = ctx.Program;

    while (ctx.stream.peek()) {
      const child = statement(ctx);
      if (child)
        node.body.push(child);
    }

    return node;
  }
}

export default Parser;

