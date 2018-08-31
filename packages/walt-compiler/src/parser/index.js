/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import Syntax from 'walt-syntax';
import statement from './statement';
import Context from './context';
import Tokenizer from '../tokenizer';
import tokenStream from '../utils/token-stream';
import Stream from '../utils/stream';
import grammar from './grammar/grammar.ne';
import nearley from 'nearley';
import type { NodeType } from '../flow/types';

export default function parse(source: string): NodeType {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(source);

  return parser.results[0];
  // const stream = new Stream(source);
  // const tokenizer = new Tokenizer(stream);
  // const tokens = tokenStream(tokenizer.parse());

  // const ctx = new Context({
  //   stream: tokens,
  //   token: tokens.tokens[0],
  //   lines: stream.lines,
  //   filename: 'unknown.walt',
  // });

  // const node: NodeType = ctx.makeNode(
  //   {
  //     value: 'ROOT_NODE',
  //   },
  //   Syntax.Program
  // );

  // // No code, no problem, empty ast equals
  // // (module) ; the most basic wasm module
  // if (!ctx.stream || !ctx.stream.length) {
  //   return node;
  // }

  // while (ctx.stream.peek()) {
  //   const child = statement(ctx);
  //   if (child) {
  //     node.params.push(child);
  //   }
  // }

  // return node;
}
