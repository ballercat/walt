/**
      // aaaa
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import invariant from 'invariant';
import grammar from './grammar/grammar.ne';
import nearley from 'nearley';
import type { NodeType } from '../flow/types';

export default function parse(source: string): NodeType {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(source);

  invariant(
    parser.results.length === 1,
    `Ambiguous syntax number of productions: ${parser.results.length}`
  );

  return parser.results[0];
}
