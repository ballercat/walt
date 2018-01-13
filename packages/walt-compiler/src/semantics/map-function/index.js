// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import mapNode from "../../utils/map-node";
import makeArraySubscript from "./map-subscript";
import makeMapIdentifier from "./map-identifier";
import makeSizeof from "./map-sizeof";
import makeAssignment from "./map-assignment";
import makeClosure from "./map-closure";
import makePair from "./map-pair";
import walkNode from "../../utils/walk-node";
import { balanceTypesInMathExpression } from "./patch-typecasts";
import {
  array as setMetaArray,
  constant as setMetaConst,
  localIndex as setMetaLocalIndex,
  funcIndex as setMetaFunctionIndex,
  typeIndex as setMetaTypeIndex,
} from "../metadata";

const mapFunctionNode = (options, node, topLevelTransform) => {
  const { types, functions } = options;

  const functionIndex = Object.keys(functions).length;
  const resultNode = node.params[1];
  const patchedNode = {
    ...node,
    type: resultNode.type,
    meta: [...node.meta, setMetaFunctionIndex(functionIndex)],
  };
  const locals = {};
  const closures = new WeakMap([]);

  functions[node.value] = patchedNode;

  const mapIdentifier = makeMapIdentifier({ ...options, locals });
  const mapArraySubscript = makeArraySubscript({ ...options, locals });
  const mapSizeof = makeSizeof({ ...options, locals });
  const mapAssignment = makeAssignment({ ...options, locals });
  const mapClosure = makeClosure({
    ...options,
    func: patchedNode,
    locals,
    closures,
  });
  const mapPair = makePair({
    ...options,
    mapIdentifier,
    mapClosure,
    topLevelTransform,
  });

  let closureCount = 0;
  const getClosureId = enclosingName => {
    closureCount += 1;
    return `__${enclosingName}_Closure_${closureCount}`;
  };
  walkNode({
    [Syntax.Closure]: (closure, _) => {
      const variables = {};
      const closureLocals = {};
      const closureIdentifier = (id, __) => {
        closureLocals[id.value] = id;
      };
      walkNode({
        [Syntax.Declaration]: closureIdentifier,
        [Syntax.ImmutableDeclaration]: closureIdentifier,
        [Syntax.Identifier]: identifier => {
          if (closureLocals[identifier.value] == null) {
            variables[identifier.value] = identifier;
          }
        },
      })(closure);

      closures.set(closure, { id: getClosureId(node.value), variables });
    },
  })(patchedNode);

  const mapDeclaration = isConst => (declaration, transform) => {
    if (locals[declaration.value] == null) {
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
        params: declaration.params.map(transform),
        Type: Syntax.Declaration,
      };
      return locals[declaration.value];
    }
    return declaration;
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
      if (call.value === "sizeof") {
        return mapSizeof(call);
      }
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
    [Syntax.Pair]: mapPair,
    // Unary expressions need to be patched so that the LHS type matches the RHS
    [Syntax.UnaryExpression]: (unaryNode, transform) => {
      const lhs = unaryNode.params[0];
      // Recurse into RHS and determine types
      const rhs = transform(unaryNode.params[1]);
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
    [Syntax.BinaryExpression]: (binaryNode, transform) => {
      return balanceTypesInMathExpression({
        ...binaryNode,
        params: binaryNode.params.map(transform),
      });
    },
    [Syntax.TernaryExpression]: (ternaryNode, transform) => {
      const params = ternaryNode.params.map(transform);
      return {
        ...ternaryNode,
        type: params[0].type,
        params,
      };
    },
    [Syntax.Select]: (binaryNode, transform) => {
      return balanceTypesInMathExpression({
        ...binaryNode,
        params: binaryNode.params.map(transform),
      });
    },
    [Syntax.Assignment]: mapAssignment,
    [Syntax.MemoryAssignment]: (inputNode, transform) => {
      const params = inputNode.params.map(transform);
      const { type } = params[0];
      return { ...inputNode, params, type };
    },
    [Syntax.ArraySubscript]: mapArraySubscript,
    [Syntax.Sizeof]: mapSizeof,
  })(patchedNode);
};

export default curry(mapFunctionNode);
