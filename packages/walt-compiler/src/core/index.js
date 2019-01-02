/**
 * Core language plugin
 *
 * The parsers in here very closely mirror the underlying WebAssembly structure
 * and are used as the core language for every feature built on top.
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import {
  current as currentScope,
  namespace,
  index as scopeIndex,
  find,
} from 'walt-parser-tools/scope';
import { extendNode } from '../utils/extend-node';
import { TYPE_CAST, TYPE_CONST } from '../semantics/metadata';
import { typeWeight } from '../types';
import type { SemanticPlugin } from '../flow/types';

const balanceTypesInMathExpression = expression => {
  // find the heaviest type in the expression
  const type = expression.params.reduce((acc, { type: childType }) => {
    // The way we do that is by scanning the top-level nodes in our expression
    if (typeWeight(acc) < typeWeight(childType)) {
      return childType;
    }

    return acc;
  }, expression.type);

  // iterate again, this time, patching any lighter types
  const params = expression.params.map(paramNode => {
    if (
      paramNode.type != null &&
      typeWeight(paramNode.type) !== typeWeight(type)
    ) {
      // Convert constants to the desired type directly
      if (paramNode.Type === Syntax.Constant) {
        return extendNode(
          {
            type,
          },
          paramNode
        );
      }

      return extendNode(
        {
          type,
          value: paramNode.value,
          Type: Syntax.TypeCast,
          meta: {
            [TYPE_CAST]: { to: type, from: paramNode.type },
          },
          params: [paramNode],
        },
        paramNode
      );
    }

    return paramNode;
  });

  return {
    ...expression,
    params,
    type,
  };
};

// Core plugin
export default function Core(): SemanticPlugin {
  return {
    semantics() {
      // Parse declaration node
      const declaration = next => ([node, context]) => {
        const scope = currentScope(context.scopes);
        const index = scopeIndex(scope, node.value);

        scope[node.value] = extendNode(
          {
            params: node.params.map(extendNode({ type: node.type })),
            meta: {
              ...node.meta,
              [scope[namespace]]: index,
              [TYPE_CONST]: node.Type === Syntax.ImmutableDeclaration,
            },
            Type: Syntax.Declaration,
          },
          node
        );

        return next([scope[node.value], context]);
      };

      return {
        [Syntax.Export]: next => ([node, context]) => {
          const parsed = next([node, context]);
          const [child] = parsed.params;
          context.exports[child.value] = child;

          return parsed;
        },
        [Syntax.Declaration]: declaration,
        [Syntax.ImmutableDeclaration]: declaration,
        // CharacterLiteral: next => ([node]) => next([mapCharacterLiteral(node)]),
        [Syntax.Select]: _ => ([node, context], transform) =>
          balanceTypesInMathExpression({
            ...node,
            params: node.params.map(child => transform([child, context])),
          }),
        [Syntax.BinaryExpression]: _ => ([node, context], transform) =>
          balanceTypesInMathExpression({
            ...node,
            params: node.params.map(child => transform([child, context])),
          }),
        [Syntax.Pair]: _next => (args, transform) => {
          const [typeCast, context] = args;

          const params = typeCast.params.map(p => transform([p, context]));
          const [targetNode, typeNode] = params;
          const { type: from } = targetNode;
          const { value: to } = typeNode;

          return {
            ...typeCast,
            type: to,
            value: targetNode.value,
            Type: Syntax.TypeCast,
            meta: { ...typeCast.meta, [TYPE_CAST]: { to, from } },
            // We need to drop the typeNode here, because it's not something we can generate
            params: [targetNode],
          };
        },
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          let ref = find(context.scopes, node.value);
          if (ref) {
            return {
              ...node,
              meta: { ...node.meta, ...ref.meta },
              type: ref.type,
            };
          }

          // null-expr
          if (node.value === 'null') {
            return {
              ...node,
              value: '0',
              type: 'i32',
              Type: Syntax.Constant,
            };
          }

          return next(args);
        },
        [Syntax.TernaryExpression]: next => ([node, context]) => {
          return next([
            balanceTypesInMathExpression({
              ...node,
              // Flatten out the parameters, put the condition node last
              params: [...node.params[1].params, node.params[0]],
            }),
            context,
          ]);
        },
      };
    },
  };
}
