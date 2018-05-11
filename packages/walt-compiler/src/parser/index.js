/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import Syntax from "../Syntax";
import statement from "./statement";
import Context from "./context";
import Tokenizer from "../tokenizer";
import tokenStream from "../utils/token-stream";
import Stream, { async as asyncStream } from "../utils/stream";
import type { NodeType } from "../flow/types";

export const async = (source: string): Promise<NodeType> => {
  return asyncStream(source).then(stream => {
    const tokenizer = new Tokenizer(stream);
    const tokens = tokenStream(tokenizer.parse());
    const ctx = new Context({
      stream: tokens,
      token: tokens.tokens[0],
      lines: stream.lines,
      filename: "unknown.walt",
    });

    const node: NodeType = ctx.makeNode(
      {
        value: "ROOT_NODE",
      },
      Syntax.Program
    );

    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!ctx.stream || !ctx.stream.length) {
      return node;
    }

    while (ctx.stream.peek()) {
      const child = statement(ctx);
      if (child) {
        node.params.push(child);
      }
    }

    return node;
  });
};

export default function parse(source: string): NodeType {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokens = tokenStream(tokenizer.parse());

  const ctx = new Context({
    stream: tokens,
    token: tokens.tokens[0],
    lines: stream.lines,
    filename: "unknown.walt",
  });

  const node: NodeType = ctx.makeNode(
    {
      value: "ROOT_NODE",
    },
    Syntax.Program
  );

  // No code, no problem, empty ast equals
  // (module) ; the most basic wasm module
  if (!ctx.stream || !ctx.stream.length) {
    return node;
  }

  while (ctx.stream.peek()) {
    const child = statement(ctx);
    if (child) {
      node.params.push(child);
    }
  }

  return node;
}
