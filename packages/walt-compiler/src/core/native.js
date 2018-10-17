/**
 * Native methods plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { extendNode } from '../utils/extend-node';
import type { SemanticPlugin } from '../flow/types';

export default function nativePlugin(): SemanticPlugin {
  return {
    semantics() {
      return {
        [Syntax.FunctionCall]: next => (args, transform) => {
          const [node, context] = args;
          const [id, ...fnArgs] = node.params;
          if (
            id.Type === Syntax.Access &&
            id.params[0] &&
            id.params[0].Type === Syntax.Type
          ) {
            const [type, method] = id.params;

            return extendNode(
              {
                value: `${type.value}.${method.value}`,
                type: type.value,
                params: fnArgs.map(p => transform([p, context])),
                Type: Syntax.NativeMethod,
              },
              node
            );
          }

          return next(args);
        },
        [Syntax.Unreachable]: _ => ([node]) => {
          return extendNode(
            {
              value: 'unreachable',
              params: [],
              Type: Syntax.NativeMethod,
            },
            node
          );
        },
      };
    },
  };
}
