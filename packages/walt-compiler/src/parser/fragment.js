/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import curry from 'curry';
import type { NodeType } from '../flow/types';

export const makeFragment = curry(
  (parser: string => NodeType, source: string): NodeType => {
    // For fragments we must wrap the source in a function
    // otherwise the parser will fail as it's not a valid
    // place for an expression
    const program = parser(`function fragment() {
    ${source};
  }`);
    // 1st node is a function.
    // 3rd node of a function is a block, containing a single expression
    return program.params[0].params[2].params[0];
  }
);
