/**
 * Handles access to memory and Memory type declaration
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { GLOBAL_INDEX } from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';

const isMemoryIdentifier = (context, id) => {
  const memory = context.memories[0];
  return memory && memory.value === id.value;
};

export default function memoryPlugin(): SemanticPlugin {
  return {
    semantics() {
      return {
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
        [Syntax.FunctionCall]: next => (args, transform) => {
          const [node, context] = args;
          const [subscript, ...rest] = node.params;
          const [id, field = {}] = subscript.params;

          const callMap = {
            dataSize: {
              ...id,
              type: 'i32',
              meta: { ALIAS: 'Memory' },
              Type: Syntax.Access,
              params: [
                {
                  ...id,
                  type: 'i32',
                  value: '0',
                  Type: Syntax.Constant,
                },
                {
                  ...id,
                  type: 'i32',
                  value: '0',
                  Type: Syntax.Constant,
                },
              ],
            },
            grow: {
              ...id,
              value: 'grow_memory',
              params: rest.map(p => transform([p, context])),
              Type: Syntax.NativeMethod,
            },
            size: {
              ...id,
              value: 'current_memory',
              params: [],
              Type: Syntax.NativeMethod,
            },
          };

          const mapped = callMap[field.value];
          if (
            !(
              subscript.Type === Syntax.Access &&
              isMemoryIdentifier(context, id) &&
              mapped
            )
          ) {
            return next(args);
          }

          return mapped;
        },
      };
    },
  };
}
