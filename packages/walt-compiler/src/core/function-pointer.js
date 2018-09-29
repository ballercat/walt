/**
 * Function pointer plugin.
 * Handles function pointer declaration and indirect calls.
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { find } from 'walt-parser-tools/scope';
import { extendNode } from '../utils/extend-node';
import {
  TYPE_INDEX,
  GLOBAL_INDEX,
  FUNCTION_INDEX,
} from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';

export default function functionPointer(): SemanticPlugin {
  return {
    semantics() {
      return {
        // Handle Table definitions
        [Syntax.ImmutableDeclaration]: next =>
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
        [Syntax.Identifier]: next =>
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
        [Syntax.FunctionResult]: next => (args, transform) => {
          const [node, context] = args;
          const { types } = context;
          if (!types[node.type]) {
            return next(args);
          }

          return next([
            extendNode(
              {
                type: 'i32',
                meta: { ALIAS: node.type },
                params: node.params.map(p => transform([p, context])),
              },
              node
            ),
            context,
          ]);
        },
        [Syntax.FunctionCall]: next =>
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
              ...call.params.slice(1),
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
