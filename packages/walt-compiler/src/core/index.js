/**
 * Core language plugin
 *
 * The parsers in here very closly mirror the underlying WebAssembly structure
 * and are used as the core language for every feature built on top.
 */
import Syntax from '../Syntax';
import { extendNode } from '../utils/extend-node';
import {
  TYPE_CAST,
  TYPE_CONST,
  GLOBAL_INDEX,
  LOCAL_INDEX,
} from '../semantics/metadata';
import { typeWeight } from '../types';

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
      return {
        ...paramNode,
        type,
        value: paramNode.value,
        Type: Syntax.TypeCast,
        meta: {
          ...paramNode.meta,
          [TYPE_CAST]: { to: type, from: paramNode.type },
        },
        params: [paramNode],
      };
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
export default function Core() {
  return {
    semantics() {
      // Parse declaration node
      const declaration = next => ([node, context]) => {
        const scope = context.locals || context.globals;
        const indexMeta = (() => {
          let index = Object.keys(scope).indexOf(node.value);
          if (index === -1) {
            index = Object.keys(scope).length;
          }
          if (scope === context.locals) {
            return { [LOCAL_INDEX]: index };
          }

          return { [GLOBAL_INDEX]: index };
        })();

        scope[node.value] = extendNode(
          {
            params: node.params.map(extendNode({ type: node.type })),
            meta: {
              ...node.meta,
              ...indexMeta,
              [TYPE_CONST]: node.Type === Syntax.ImmutableDeclaration,
            },
            Type: Syntax.Declaration,
          },
          node
        );

        return next([scope[node.value], context]);
      };

      return {
        Declaration: declaration,
        ImmutableDeclaration: declaration,
        // CharacterLiteral: next => ([node]) => next([mapCharacterLiteral(node)]),
        Select: _ => ([node, context], transform) =>
          balanceTypesInMathExpression({
            ...node,
            params: node.params.map(child => transform([child, context])),
          }),
        BinaryExpression: _ => ([node, context], transform) =>
          balanceTypesInMathExpression({
            ...node,
            params: node.params.map(child => transform([child, context])),
          }),
        Pair: next => (args, transform) => {
          const [typeCastMaybe, context] = args;
          // Ignore everything in global scope (promotions only possible in functions
          if (!context.locals) {
            return next(args);
          }

          const params = typeCastMaybe.params.map(p => transform([p, context]));
          const [targetNode, typeNode] = params;
          const { type: from } = targetNode;
          const { value: to } = typeNode;

          if (typeNode.Type === Syntax.Type && !!from && !!to) {
            return {
              ...typeCastMaybe,
              type: to,
              value: targetNode.value,
              Type: Syntax.TypeCast,
              meta: { ...typeCastMaybe.meta, [TYPE_CAST]: { to, from } },
              // We need to drop the typeNode here, because it's not something we can generate
              params: [targetNode],
            };
          }

          // If both sides of a pair don't have types then it's not a typecast,
          // more likely a string: value pair in an object for example
          return {
            ...typeCastMaybe,
            params,
          };
        },
        Identifier: next => args => {
          const [node, context] = args;

          let ref;
          if (context.locals) {
            ref = context.locals[node.value];
          }
          if (!ref) {
            ref = context.globals[node.value];
          }
          if (ref) {
            return {
              ...node,
              meta: { ...node.meta, ...ref.meta },
              type: ref.type,
            };
          }

          return next(args);
        },
        MemoryAssignment: _ignore => (args, transform) => {
          const [inputNode, context] = args;
          const params = inputNode.params.map(p => transform([p, context]));
          const { type } = params[0];
          return { ...inputNode, params, type };
        },
      };
    },
  };
}
