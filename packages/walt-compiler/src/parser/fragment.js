/**
 * Tag template literal for parsing stand alone statements
 *
 * For expressions, wrap the source string with parens. For example
 * an binary expression is not a valid statement (1 + 1), but wrapping
 * it with parens IS.
 *
 * 1 + 1 -> ERROR!
 * (1 + 1); -> OK!
 *
 */
// @flow
import { mapNode } from 'walt-parser-tools/map-node';
import type { NodeType } from '../flow/types';

type Parser = string => NodeType;

/**
 * Fragment tag template literal factory. All input strings must be valid
 * statements.
 *
 * @return {Function} tag template literal
 */
/* istanbul ignore next */
export const makeFragment = (parser: Parser) => {
  // For fragments we must wrap the source in a function
  // otherwise the parser will fail as it's not a valid
  // place for an expression
  const parse = src => {
    if (process.env.NODE_ENV === 'development') {
      try {
        // 1st node is a function.
        // 3rd node of a function is a block, containing a single expression
        return parser(`function fragment() {
        ${src}
      }`).params[0].params[2].params[0];
      } catch (e) {
        throw new Error(
          `PANIC - Invalid fragment input:

${src}

Parse Error: ${e.stack}`
        );
      }
    } else {
      return parser(`function fragment() {
        ${src}
      }`).params[0].params[2].params[0];
    }
  };

  return (template: string[], ...replacements: Array<string | NodeType>) => {
    let expandNodes = false;
    // Build out a placeholder source string which will be compiled
    const source = template.reduce((a, v, i) => {
      const rep = replacements[i];
      if (rep != null && typeof rep !== 'object') {
        return (a += v + String(rep));
      }

      if (rep != null) {
        expandNodes = true;
        return (a += v + `$$rep_${i}`);
      }

      return (a += v);
    }, '');

    const node = parse(source);

    // Expand any Node objects if necessary
    if (expandNodes) {
      return mapNode({
        Identifier(id) {
          const { value: name } = id;
          if (!name.indexOf('$$rep_')) {
            return replacements[Number(name.replace('$$rep_', ''))];
          }
          return id;
        },
      })(node);
    }

    return node;
  };
};
