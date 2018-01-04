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
import Stream from "../utils/stream";
import TokenStream from "../utils/token-stream";

import type { NodeType } from "../flow/types";

export default function parse(source: string): NodeType {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokens = new TokenStream(tokenizer.parse());

  const ctx = new Context({
    stream: tokens,
    token: tokens.next(),
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
