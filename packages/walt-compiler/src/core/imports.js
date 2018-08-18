import Syntax from '../Syntax';
import { mapNode } from 'walt-parser-tools/map-node';
import {
  FUNCTION_INDEX,
  TYPE_INDEX,
  TYPE_CONST,
  GLOBAL_INDEX,
} from '../semantics/metadata';

export default function Imports() {
  return {
    semantics: () => ({
      Import: _next => args => {
        const [node, context] = args;
        return mapNode({
          [Syntax.BinaryExpression]: (as, transform) => {
            const [maybePair, asIdentifier] = as.params;
            // if the original import is not typed this isn't a valid import and is ignored
            if (maybePair.Type !== Syntax.Pair) {
              // No transform happens here (the transform is what creates the global fn to reference)
              return as;
            }
            // Continue transforming the import as before, the AS metadata will notify
            // the generator to ask for the original import.
            const [original, typeNode] = maybePair.params;

            return transform({
              ...maybePair,
              params: [
                {
                  ...asIdentifier,
                  meta: {
                    ...original.meta,
                    // <new-value> AS <original-value>
                    AS: original.value,
                  },
                },
                typeNode,
              ],
            });
          },
          [Syntax.Pair]: (pairNode, __) => {
            const { types, functions, globals } = context;
            const [identifierNode, typeNode] = pairNode.params;

            if (types[typeNode.value] != null) {
              // crate a new type

              const functionIndex = Object.keys(functions).length;
              const typeIndex = Object.keys(types).indexOf(typeNode.value);
              const functionNode = {
                ...identifierNode,
                id: identifierNode.value,
                type: types[typeNode.value].type,
                meta: {
                  ...identifierNode.meta,
                  [FUNCTION_INDEX]: functionIndex,
                  [TYPE_INDEX]: typeIndex,
                  FUNCTION_METADATA:
                    types[typeNode.value].meta.FUNCTION_METADATA,
                  DEFAULT_ARGUMENTS:
                    types[typeNode.value].meta.DEFAULT_ARGUMENTS,
                },
              };
              functions[identifierNode.value] = functionNode;
              return {
                ...pairNode,
                params: [functionNode, types[typeNode.value]],
              };
            }

            if (!['Table', 'Memory'].includes(typeNode.type)) {
              const index = Object.keys(globals).length;

              globals[identifierNode.value] = {
                ...identifierNode,
                meta: { [GLOBAL_INDEX]: index, [TYPE_CONST]: true },
                type: typeNode.type,
              };
            }

            return pairNode;
          },
        })(node);
      },
    }),
  };
}
