/**
 * Handles access to memory and Memory type declaration
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { GLOBAL_INDEX } from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';

export default function memoryPlugin(): SemanticPlugin {
  return {
    semantics() {
      return {
        [Syntax.Identifier]: next => args => {
          const [identifier] = args;
          if (identifier.value === '__DATA_LENGTH__') {
            return {
              ...identifier,
              type: 'i32',
              Type: Syntax.ArraySubscript,
              params: [
                {
                  ...identifier,
                  type: 'i32',
                  value: '0',
                  Type: Syntax.Constant,
                },
                {
                  ...identifier,
                  type: 'i32',
                  value: '0',
                  Type: Syntax.Constant,
                },
              ],
            };
          }

          return next(args);
        },
        [Syntax.ImmutableDeclaration]: next => args => {
          const [decl, context] = args;
          const { scopes, memories } = context;

          // Short circuit since memory is a special type of declaration
          if (
            !scopes.length < 2 &&
            decl.type === 'Memory' &&
            !memories.length
          ) {
            memories.push({
              ...decl,
              meta: {
                ...decl.meta,
                [GLOBAL_INDEX]: -1,
              },
            });
            return memories[0];
          }

          return next(args);
        },
        [Syntax.ArraySubscript]: next => (args, transform) => {
          const [node, context] = args;
          const params = node.params.map(p => transform([p, context]));
          const [identifier, field] = params;
          const memory = context.memories[0];
          const name = identifier.value;

          if (!(memory.value === name && field.value === 'dataSize')) {
            return next(args);
          }

          return {
            ...identifier,
            type: 'i32',
            Type: Syntax.ArraySubscript,
            params: [
              {
                ...identifier,
                type: 'i32',
                value: '0',
                Type: Syntax.Constant,
              },
              {
                ...identifier,
                type: 'i32',
                value: '0',
                Type: Syntax.Constant,
              },
            ],
          };
        },
      };
    },
  };
}
