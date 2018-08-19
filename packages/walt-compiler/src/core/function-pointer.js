import Syntax from '../Syntax';
import { find } from 'walt-parser-tools/scope';
import {
  TYPE_INDEX,
  GLOBAL_INDEX,
  FUNCTION_INDEX,
} from '../semantics/metadata';

export default function functionPointer() {
  return {
    semantics() {
      return {
        // Handle Table definitions
        ImmutableDeclaration: next =>
          function defineTable(args) {
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
        Identifier: next =>
          function pointer(args) {
            const [node, context] = args;
            const { functions, table, scopes } = context;

            if (find(scopes, node.value) || !functions[node.value]) {
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
        FunctionCall: next =>
          function indirectCall(args, transform) {
            const [call, context] = args;
            const { scopes, types } = context;
            const ref = find(scopes, call.value);
            // Nothing we need transform
            if (!ref) {
              return next(args);
            }

            const typedef = types[ref.type];
            const typeIndex = Object.keys(types).indexOf(ref.type);

            // We will short all of the other middleware so transform the parameters
            // here and append an identifier which will be used to get the table
            // value
            const params = [
              ...call.params,
              { ...ref, Type: Syntax.Identifier },
            ].map(p => transform([p, context]));

            return {
              ...call,
              meta: {
                ...call.meta,
                ...ref.meta,
                [TYPE_INDEX]: typeIndex,
              },
              type: typedef != null ? typedef.type : call.type,
              params,
              Type: Syntax.IndirectFunctionCall,
            };
          },
      };
    },
  };
}
