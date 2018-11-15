/**
 * This plugin converts Assignments to Assignment-Expressions (where applies)
 * The difference between the two is that the expression form also returns the
 * value. (this is a tee_local opcode)
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { mapNode } from 'walt-parser-tools/map-node';
import { extendNode } from '../utils/extend-node';
import { LOCAL_INDEX } from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';

export default function AssignmentExpressionPlugin(): SemanticPlugin {
  const convertExpressions = mapNode({
    [Syntax.Assignment]: node => {
      const [target] = node.params;
      if (target.meta[LOCAL_INDEX] == null) {
        return node;
      }

      return extendNode({ Type: Syntax.AssignmentExpression }, node);
    },
  });

  return {
    semantics() {
      return {
        [Syntax.BinaryExpression]: next => args => {
          const parsed = next(args);

          return convertExpressions(parsed);
        },
        [Syntax.Loop]: next => args => {
          const parsed = next(args);
          // second parameter is always a condition expression for both for-loops
          // and while-loops
          parsed.params[1] = convertExpressions(parsed.params[1]);

          return parsed;
        },
      };
    },
  };
}
