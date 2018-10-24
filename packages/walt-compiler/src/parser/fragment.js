/*
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import curry from 'curry';
import type { NodeType } from '../flow/types';

/**
 * A helper utility for parsing only parts of a program ("fragments") like
 * individual statements and expressions. Requires a valid parser method.
 * Particularly useful when it's necessary to generate complex statements or
 * expressions and doing so by hand is too tedious.
 *
 * For example here is how a unary negation is transformed in the compiler.
 * @example
 * // Transform bang
 * case '!':
 *   const shift = shifts[lhs.type];
 *   return transform([
 *     fragment(
 *       `(((${String(lhs.value)} >> ${shift}) | ((~${String(
 *         lhs.value
 *       )} + 1) >> ${shift})) + 1)`
 *     ), context);
 *
 * @param {Function} parser Parser method
 * @param {string}   source Source fragment to parse
 *
 * @returns {NodeType} Parsed node. Has no type information
 */
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
