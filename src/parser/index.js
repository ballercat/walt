//@flow
import statement from "./statement";
import Context from "./context";
import type TokenStream from "../utils/token-stream";

class Parser {
  context: Context;

  constructor(tokens: TokenStream, lines: string[] = []) {
    this.context = new Context({
      body: [],
      diAssoc: "right",
      stream: tokens,
      token: tokens.next(),
      lines,
      globals: [],
      functions: [],
      filename: "unknown.walt"
    });
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
      if (child) {
node.body.push(child);
}
    }

    return node;
  }
}

export default Parser;
