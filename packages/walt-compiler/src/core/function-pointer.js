import Syntax from '../Syntax';
import { GLOBAL_INDEX, FUNCTION_INDEX } from '../semantics/metadata';

export default function functionPointer() {
  return {
    semantics() {
      return {
        // Handle Table definitions
        ImmutableDeclaration: next => args => {
          const [decl, context] = args;

          // Short circuit since memory is a special type of declaration
          if (!context.locals && decl.type === 'Table') {
            return {
              ...decl,
              meta: {
                ...decl.meta,
                [GLOBAL_INDEX]: -1,
              },
            };
          }

          return next(args);
        },
        Identifier: next => args => {
          const [node, context] = args;
          const { functions, table } = context;

          if (!functions[node.value]) {
            return next(args);
          }

          if (table[node.value] == null) {
            table[node.value] = functions[node.value];
          }

          return {
            ...node,
            type: 'i32',
            meta: {
              [FUNCTION_INDEX]: functions[node.value].meta[FUNCTION_INDEX],
            },
            value: Object.keys(table).indexOf(node.value),
            Type: Syntax.FunctionPointer,
          };
        },
      };
    },
  };
}
