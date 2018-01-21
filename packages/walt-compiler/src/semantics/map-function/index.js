// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import mapNode from "../../utils/map-node";
import { parseDeclaration } from "./declaration";
import makeArraySubscript from "./map-subscript";
import makeMapIdentifier from "./map-identifier";
import makeSizeof from "./map-sizeof";
import makeAssignment from "./map-assignment";
import makeFunctionCall from "./map-function-call";
import makeClosure, {
  mapIdentifierToOffset,
  CLOSURE_BASE,
  CLOSURE_GET,
  CLOSURE_SET,
} from "../closure";
import makePair from "./map-pair";
import walkNode from "../../utils/walk-node";
import { balanceTypesInMathExpression } from "./patch-typecasts";
import {
  localIndex as setMetaLocalIndex,
  funcIndex as setMetaFunctionIndex,
} from "../metadata";

const mapFunctionNode = (options, node, topLevelTransform) => {
  const { functions } = options;

  const functionIndex = Object.keys(functions).length;
  const resultNode = node.params[1];
  const patchedNode = {
    ...node,
    type: resultNode.type.indexOf("<>") > 0 ? "i64" : resultNode.type,
    meta: [...node.meta, setMetaFunctionIndex(functionIndex)],
  };
  const locals = {};
  const closures = { variables: {}, offsets: {}, size: 0 };

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
    locals,
    mapIdentifier,
    mapClosure,
    topLevelTransform,
  });
  const mapFunctonCall = makeFunctionCall({
    ...options,
    locals,
    mapIdentifier,
    mapSizeof,
  });

  walkNode({
    [Syntax.Closure]: (closure, _) => {
      const args = {};
      const variables = {};
      const closureLocals = {};
      const closureIdentifier = (id, __) => {
        closureLocals[id.value] = id;
      };
      walkNode({
        [Syntax.FunctionArguments]: (fnArgs, __) => {
          walkNode({
            [Syntax.Pair]: pair => {
              args[pair.params[0].value] = true;
            },
          })(fnArgs);
        },
        [Syntax.Declaration]: closureIdentifier,
        [Syntax.ImmutableDeclaration]: closureIdentifier,
        [Syntax.Identifier]: identifier => {
          if (
            closureLocals[identifier.value] == null &&
            variables[identifier.value] == null &&
            !args[identifier.value]
          ) {
            variables[identifier.value] = identifier;
            closures.size += 4;
          }
        },
      })(closure);

      closures.variables = { ...closures.variables, ...variables };
    },
  })(patchedNode);

  console.log("OFFSETS ", closures.offsets);
  if (Object.keys(closures.variables).length) {
    patchedNode.params = [
      ...patchedNode.params.slice(0, 2),
      {
        ...patchedNode.params[2],
        value: CLOSURE_BASE,
        type: "i32",
        Type: Syntax.Declaration,
        params: [
          mapFunctonCall({
            ...patchedNode.params[2],
            value: CLOSURE_GET,
            type: "i32",
            meta: [],
            Type: Syntax.FunctionCall,
            params: [
              {
                ...patchedNode.params[2],
                params: [],
                type: "i32",
                value: closures.size,
                Type: Syntax.Constant,
              },
            ],
          }),
        ],
      },
      ...patchedNode.params.slice(2),
    ];
  }

  walkNode({
    [Syntax.Declaration]: parseDeclaration(false, {
      ...options,
      locals,
      closures,
    }),
    [Syntax.ImmutableDeclaration]: parseDeclaration(true, {
      ...options,
      locals,
      closures,
    }),
  })(patchedNode);

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
    [Syntax.Declaration]: (decl, transform) => {
      const [init] = decl.params;
      if (init && closures.variables[decl.value] != null) {
        const { offsets } = closures;
        return transform({
          ...init,
          value: `${CLOSURE_SET}-${decl.type}`,
          params: [
            {
              ...mapIdentifierToOffset(
                { ...init, value: CLOSURE_BASE },
                offsets[decl.value]
              ),
            },
            init,
          ],
          meta: [],
          Type: Syntax.FunctionCall,
        });
      }
      return locals[decl.value];
    },
    [Syntax.ImmutableDeclaration]: decl => {
      return locals[decl.value];
    },
    [Syntax.Identifier]: mapIdentifier,
    [Syntax.FunctionCall]: mapFunctonCall,
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
