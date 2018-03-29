/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import statement from "./statement";
import expression from "./expression";
import Context from "./context";
import Tokenizer from "../tokenizer";
import Stream from "../utils/stream";
import tokenStream from "../utils/token-stream";

import type { NodeType } from "../flow/types";

export const fragment = (
  source: string,
  parser: (ctx: Context) => any
): NodeType => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokens = tokenStream(tokenizer.parse());

  const ctx = new Context({
    stream: tokens,
    token: tokens.tokens[0],
    lines: stream.lines,
    filename: "unknown.walt",
  });

  return parser(ctx);
};

export const expressionFragment = (source: string) =>
  fragment(source, expression);
export const statementFragment = (source: string) =>
  fragment(source, statement);
