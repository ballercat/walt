import Syntax from '../Syntax';

export default function nativePlugin() {
  return {
    semantics() {
      return {
        ArraySubscript: next => (args, transform) => {
          const [node, context] = args;
          const [identifier, field] = node.params;
          if (
            identifier.Type === Syntax.Type &&
            field.Type === Syntax.FunctionCall
          ) {
            return {
              ...node,
              Type: Syntax.NativeMethod,
              type: identifier.value,
              value: identifier.value + '.' + field.value,
              params: field.params.map(p => transform([p, context])),
            };
          }

          return next(args);
        },
      };
    },
  };
}
