/**
 * Automatic Reference Counting plugin
 *
 * @author Arthur Buldauskas<arhturbuldauskas@gmail.com>
 */
import Syntax from 'walt-syntax';
import { extendNode } from '../utils/extend-node';
import { find } from 'walt-parser-tools/scope';
import hasNode from 'walt-parser-tools/has-node';
import grammar from './arc.ne';

// const ARC_POINTER_TYPE = 'i64';
const ARC_IMPORTS = `
  import {
    __arc_allocate : ARC_ALLOCATE,
    __arc_free     : ARC_FREE
  } from 'ARC';

  type ARC_FREE = (i32) => void;
  type ARC_ALLOCATE = (i32) => i32;
`;

export function imports(_options, _compile) {}

export function plugin() {
  return {
    semantics({ parser, fragment }) {
      const ftag = fragment.tag;
      return {
        [Syntax.Program]: next => args => {
          const [program, context] = args;

          const arcHeader = parser(ARC_IMPORTS).params;

          return next([
            extendNode(
              {
                params: arcHeader.concat(program.params),
              },
              program
            ),
            context,
          ]);
        },
        [Syntax.FunctionDeclaration]: next => (args, _transform) => {
          const [node, context] = args;
          const references = {};
          const parsed = next([node, { ...context, references }]);

          return parsed;
        },
        [Syntax.ReturnStatement]: next => (args, transform) => {
          const [, context] = args;
          const ret = next(args);
          if (!Object.keys(context.references)) {
            return ret;
          }

          const [returnVal] = ret.params;
          // Transfer return value to a local so that we can free without
          // accidentally reading the freed memory in a return.
          const value = ftag`const __ret_value : ${ret.type} = ${returnVal}`;

          const frees = Object.values(context.references).map(
            ref => ftag`__arc_free(${ref.value})`
          );

          return extendNode(
            {
              Type: Syntax.Block,
              type: null,
              params: [
                transform([value, context]),
                ...frees.map(f => transform([f, context])),
                extendNode(
                  {
                    params: [transform([ftag`(__ret_value)`, context])],
                  },
                  ret
                ),
              ],
            },
            ret
          );
        },
        ARCDeclaration: next => args => {
          const [node, context] = args;
          if (!node.meta.ARC) {
            return next(args);
          }

          // we are going to expand the declaration into two statements
          // First, create an allocation
          const allocate = ftag`__arc_allocate(sizeof(${node.type}))`;

          // Then move the original initializer to a stand-alone assignment statement
          const [initializer] = node.params;
          const declaration = extendNode(
            {
              params: [allocate],
              Type: Syntax.Declaration,
            },
            node
          );

          const assignment = ftag`${node.value} = ${initializer}`;

          // now instead of parsing a declaration return a block
          const block = next([
            extendNode(
              {
                Type: Syntax.Block,
                params: [declaration, assignment],
              },
              node
            ),
            context,
          ]);

          context.references[node.value] = find(context.scopes, node.value);

          return block;
        },
      };
    },
    grammar,
  };
}
