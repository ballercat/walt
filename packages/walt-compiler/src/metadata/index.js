// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import mapNode from "../utils/map-node";
import patchTypeCasts, {
  balanceTypesInMathExpression,
} from "../parser/patch-typecasts";
import { getKindConstant } from "../generator/import";
import { EXTERN_FUNCTION } from "../emitter/external_kind";
import {
  get,
  GLOBAL_INDEX,
  FUNCTION_INDEX,
  TYPE_OBJECT,
  localIndexMap,
  constant as setMetaConst,
  localIndex as setMetaLocalIndex,
  globalIndex as setMetaGlobalIndex,
  funcIndex as setMetaFunctionIndex,
  tableIndex as setMetaTableIndex,
  typeIndex as setMetaTypeIndex,
} from "./metadata";

import type { Metadata, NodeType } from "../flow/types";

export default function metadata(ast: NodeType): NodeType {
  const initializeLocals = (argsNode: NodeType): Metadata => {
    const payload = {};
    walkNode({
      [Syntax.Pair]: pairNode => {
        const [identifierNode] = pairNode.params;
        payload[identifierNode.value] = identifierNode;
      },
    })(argsNode);

    return localIndexMap(payload);
  };

  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};

  // Types have to be pre-parsed before the rest of the program
  walkNode({
    [Syntax.Typedef]: node => {
      types[node.value] = node;
    },
  })(ast);

  return mapNode({
    // Read Import node, attach indexes if non-scalar
    [Syntax.Import]: (node, _ignore) => {
      return mapNode({
        [Syntax.Pair]: pairNode => {
          const [identifierNode, typeNode] = pairNode.params;
          if (types[typeNode.value] != null) {
            // crate a new type
            const functionIndex = Object.keys(functions).length;
            const typeIndex = Object.keys(types).indexOf(typeNode.value);
            const functionNode = {
              ...identifierNode,
              id: identifierNode.value,
              meta: [
                setMetaFunctionIndex(functionIndex),
                setMetaTypeIndex(typeIndex),
              ],
            };
            functions[identifierNode.value] = functionNode;
            return {
              ...pairNode,
              params: [functionNode, types[typeNode.value]],
            };
          }

          return pairNode;
        },
      })(node);
    },
    [Syntax.Declaration]: node => {
      const globalIndex = Object.keys(globals).length;
      const meta = [setMetaGlobalIndex(globalIndex)];
      globals[node.value] = { ...node, meta };

      return globals[node.value];
    },
    [Syntax.ImmutableDeclaration]: node => {
      const globalIndex = Object.keys(globals).length;
      const meta = [setMetaGlobalIndex(globalIndex), setMetaConst()];
      globals[node.value] = { ...node, meta, Type: Syntax.Declaration };

      return globals[node.value];
    },
    [Syntax.FunctionDeclaration]: (node, _ignore) => {
      const localIndexMeta = initializeLocals(node.params[0]);
      const functionIndex = Object.keys(functions).length;
      const patchedNode = {
        ...node,
        meta: [
          ...node.meta,
          localIndexMeta,
          setMetaFunctionIndex(functionIndex),
        ],
      };
      functions[node.value] = patchedNode;

      const locals = { ...localIndexMeta.payload };

      const bodyWithMetadata = mapNode({
        [Syntax.Declaration]: declaration => {
          const index = Object.keys(locals).length;
          const meta = [setMetaLocalIndex(index)];
          locals[declaration.value] = { ...declaration, meta };
          return locals[declaration.value];
        },
        [Syntax.ImmutableDeclaration]: declaration => {
          const index = Object.keys(locals).length;
          const meta = [setMetaLocalIndex(index), setMetaConst()];
          locals[declaration.value] = {
            ...declaration,
            meta,
            Type: Syntax.Declaration,
          };

          return locals[declaration.value];
        },
        [Syntax.Identifier]: identifier => {
          // Not a function call or pointer, look-up variables
          if (locals[identifier.value] != null) {
            const index = Object.keys(locals).indexOf(identifier.value);
            return {
              ...identifier,
              type: locals[identifier.value].type,
              meta: [setMetaLocalIndex(index)],
            };
          } else if (globals[identifier.value] != null) {
            const index = Object.keys(globals).indexOf(identifier.value);
            return {
              ...identifier,
              type: globals[identifier.value].type,
              meta: [setMetaGlobalIndex(index)],
            };
          } else if (userTypes[identifier.value] != null) {
            return {
              ...identifier,
              type: "i32",
              Type: Syntax.UserType,
            };
          }

          return identifier;
        },
        [Syntax.FunctionCall]: call => {
          if (functions[call.value] != null) {
            const index = Object.keys(functions).indexOf(call.value);
            return {
              ...call,
              meta: [setMetaFunctionIndex(index)],
            };
          }

          if (locals[call.value] != null) {
            return {
              ...call,
              Type: Syntax.IndirectFunctionCall,
            };
          }

          return call;
        },
      })(patchedNode);

      return mapNode({
        // Ignore argument nodes, since they are id: type pairs
        [Syntax.FunctionArguments]: (args, _ignore) => args,
        [Syntax.Pair]: pair => {
          return patchTypeCasts(pair);
        },
        [Syntax.BinaryExpression]: binaryNode => {
          return balanceTypesInMathExpression(binaryNode);
        },
      })(bodyWithMetadata);
    },
  })(ast);
}
