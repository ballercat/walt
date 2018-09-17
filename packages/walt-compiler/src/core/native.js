import Syntax from 'walt-syntax';
import { extendNode } from '../utils/extend-node';

export default function nativePlugin() {
  return {
    semantics() {
      return {
        FunctionCall: next => (args, transform) => {
          const [node, context] = args;
          const [id, ...fnArgs] = node.params;
          if (
            id.Type === Syntax.ArraySubscript &&
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
      };
    },
  };
}
