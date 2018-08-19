import Syntax from '../Syntax';
import {
  TYPE_INDEX,
  GLOBAL_INDEX,
  FUNCTION_INDEX,
} from '../semantics/metadata';

function inScope(scopes, value) {
  return scopes.some(scope => !!scope && scope[value]);
}

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
            const { functions, table, locals, globals } = context;

            if (
              inScope([locals, globals], node.value) ||
              !functions[node.value]
            ) {
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
            const { locals, types } = context;
            const local = locals[call.value];
            // Nothing we need transform
            if (!local) {
              return next(args);
            }

            const typedef = types[local.type];
            const typeIndex = Object.keys(types).indexOf(local.type);

            // We will short all of the other middleware so transform the parameters
            // here and append an identifier which will be used to get the table
            // value
            const params = [
              ...call.params,
              { ...local, Type: Syntax.Identifier },
            ].map(p => transform([p, context]));

            return {
              ...call,
              meta: {
                ...call.meta,
                ...local.meta,
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
