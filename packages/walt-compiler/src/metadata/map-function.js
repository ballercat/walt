// @flow
import Syntax from "../Syntax";
import curry from "curry";
import mapNode from "../utils/map-node";
import makeArraySubscript from "./map-subscript";
import makeMapIdentifier from "./map-identifier";
import makeSizeof from "./map-sizeof";
import { balanceTypesInMathExpression } from "../parser/patch-typecasts";
import {
  typeCast,
  array as setMetaArray,
  constant as setMetaConst,
  localIndex as setMetaLocalIndex,
  funcIndex as setMetaFunctionIndex,
  typeIndex as setMetaTypeIndex,
} from "./metadata";

import type { NodeType } from "../flow/types";

const mapFunctionNode = (options, node, _ignore) => {
  const { types, functions } = options;

  const functionIndex = Object.keys(functions).length;
  const resultNode = node.params[1];
  const patchedNode = {
    ...node,
    type: resultNode.type,
    meta: [...node.meta, setMetaFunctionIndex(functionIndex)],
  };
  const locals = {};

  functions[node.value] = patchedNode;

  const mapIdentifier = makeMapIdentifier({ ...options, locals });
  const mapArraySubscript = makeArraySubscript({ ...options, locals });
  const mapSizeof = makeSizeof({ ...options, locals });

  const mapDeclaration = isConst => declaration => {
    const index = Object.keys(locals).length;
    const isArray = declaration.type.slice(-2) === "[]";
    const type = isArray ? "i32" : declaration.type;
    const metaArray = isArray
      ? setMetaArray(declaration.type.slice(0, -2))
      : null;
    const meta = [
      setMetaLocalIndex(index),
      metaArray,
      isConst ? setMetaConst() : null,
    ];
    locals[declaration.value] = {
      ...declaration,
      type,
      meta,
      Type: Syntax.Declaration,
    };
    return locals[declaration.value];
  };

  return mapNode({
    [Syntax.FunctionArguments]: (args, _) => {
      return mapNode({
        [Syntax.Pair]: pairNode => {
          const [identifierNode, typeNode] = pairNode.params;
          const meta = [setMetaLocalIndex(Object.keys(locals).length)];
          const withTypeApplied = {
            ...identifierNode,
            type: typeNode.value,
            meta,
          };
          locals[identifierNode.value] = withTypeApplied;
          return {
            ...pairNode,
            params: [withTypeApplied, typeNode],
          };
        },
      })(args);
    },
    [Syntax.Declaration]: mapDeclaration(false),
    [Syntax.ImmutableDeclaration]: mapDeclaration(true),
    [Syntax.Identifier]: mapIdentifier,
    [Syntax.FunctionCall]: call => {
      if (functions[call.value] != null) {
        const index = Object.keys(functions).indexOf(call.value);
        return {
          ...call,
          type: functions[call.value].type,
          meta: [setMetaFunctionIndex(index)],
        };
      }

      if (locals[call.value] != null) {
        const local = locals[call.value];
        const global = locals[call.value];
        const typeIndex = Object.keys(types).indexOf(
          global ? global.type : local.type
        );
        const identifier = {
          ...mapIdentifier(call),
          Type: Syntax.Identifier,
        };
        const meta = [...identifier.meta, setMetaTypeIndex(typeIndex)];
        return {
          ...call,
          meta,
          params: [...call.params, identifier],
          Type: Syntax.IndirectFunctionCall,
        };
      }

      return call;
    },
    [Syntax.Pair]: (typeCastMaybe: NodeType, childMapper): NodeType => {
      const [targetNode, typeNode] = typeCastMaybe.params.map(childMapper);
      const { type: from } = targetNode;
      const { value: to } = typeNode;

      // If both sides of a pair don't have types then it's not a typecast,
      // more likely a string: value pair in an object for example
      if (typeNode.Type === Syntax.Type && !!from && !!to) {
        return {
          ...typeCastMaybe,
          type: to,
          value: targetNode.value,
          Type: Syntax.TypeCast,
          meta: [...typeCastMaybe.meta, typeCast({ to, from })],
          // We need to drop the typeNode here, because it's not something we can generate
          params: [targetNode],
        };
      }

      return {
        ...typeCastMaybe,
        params: typeCastMaybe.params.map(childMapper),
      };
    },
    // Unary expressions need to be patched so that the LHS type matches the RHS
    [Syntax.UnaryExpression]: (unaryNode, childMapper) => {
      const lhs = unaryNode.params[0];
      // Recurse into RHS and determine types
      const rhs = childMapper(unaryNode.params[1]);
      return {
        ...unaryNode,
        type: rhs.type,
        params: [
          {
            ...lhs,
            type: rhs.type,
          },
          rhs,
        ],
        Type: Syntax.BinaryExpression,
      };
    },
    [Syntax.BinaryExpression]: (binaryNode, childMapper) => {
      return balanceTypesInMathExpression({
        ...binaryNode,
        params: binaryNode.params.map(childMapper),
      });
    },
    [Syntax.Select]: (binaryNode, childMapper) => {
      return balanceTypesInMathExpression({
        ...binaryNode,
        params: binaryNode.params.map(childMapper),
      });
    },
    [Syntax.MemoryAssignment]: (inputNode, childMapper) => {
      const params = inputNode.params.map(childMapper);
      const { type } = params[0];
      return { ...inputNode, params, type };
    },
    [Syntax.ArraySubscript]: mapArraySubscript,
    [Syntax.Sizeof]: mapSizeof,
  })(patchedNode);
};

export default curry(mapFunctionNode);
