/**
 * Automatic Reference Counting plugin
 *
 * @author Arthur Buldauskas<arhturbuldauskas@gmail.com>
 */
import Syntax from 'walt-syntax';
import { extendNode } from '../utils/extend-node';
import hasNode from 'walt-parser-tools/has-node';
import grammar from './arc.ne';

const ARC_POINTER_TYPE = 'i64';
const ARC_IMPORTS = `
  import { __arc_allocate : ARC_ALLOCATE } from 'ARC';

  type ARC_ALLOCATE = (i32) => ${ARC_POINTER_TYPE};
`;

export function imports(_options, _compile) {}

export function plugin() {
  return {
    semantics({ parser, fragment }) {
      return {
        [Syntax.Program]: next => args => {
          const [program, context] = args;

          if (!hasNode('ARCDeclaration', program)) {
            return next(args);
          }

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
        ['ARCDeclaration']: next => args => {
          const [node, context] = args;
          if (!node.meta.ARC) {
            return next(args);
          }

          // we are going to expand the declaration into two statements
          // First, create an allocation
          const allocate = fragment(`__arc_allocate(sizeof(${node.type}))`);

          // Then move the original initializer to a stand-alone assignment statement
          const [initializer] = node.params;
          const declaration = extendNode(
            {
              params: [allocate],
              Type: Syntax.Declaration,
              meta: { ARC: true },
            },
            node
          );

          // Fragment() can't expand already present nodes so we zero as placeholder
          const assignment = fragment(`${node.value} = 0`);
          assignment.params = [assignment.params[0], initializer];

          // now instead of parsing a declaration return a block
          return next([
            extendNode(
              {
                Type: Syntax.Block,
                params: [declaration, assignment],
              },
              node
            ),
            context,
          ]);
        },
      };
    },
    grammar,
  };
}
