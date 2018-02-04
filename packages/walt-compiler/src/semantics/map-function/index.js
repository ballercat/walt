// @flow
/**
 * Function Semantics Parser.
 *
 * This is where 80% of the semantic logic lives. Pretty much everything in
 * WebAssembly is performed in some function. Most of the heavy logic is offloaded
 * to smaller parsers in here.
 */
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
  injectEnvironmentMaybe,
  transformClosedDeclaration,
  getEnclosedVariables,
} from "../closure";
import makePair from "./map-pair";
import walkNode from "../../utils/walk-node";
import { balanceTypesInMathExpression } from "./patch-typecasts";
import { collapseClosureIdentifier, CLOSURE_BASE } from "../closure";
import {
  funcIndex as setMetaFunctionIndex,
  get,
  CLOSURE_TYPE,
} from "../metadata";
import type { NodeType } from "../../flow/types";

/**
 * Initialize function node and patch it's type and meta
 */
const initialize = (options, node: NodeType) => {
  const { functions, types } = options;
  // All of the local variables need to be mapped
  const locals = {};
  const closures = {
    // Capture all enclosed variables if any
    variables: getEnclosedVariables(node),
    // All of the closure offsets need to be tracked
    offsets: {},
    envSize: 0,
  };

  // Walk the node and calculate closure env size and closure offsets
  const fun = walkNode({
    // Function arguments need to be accounted for as well
    [Syntax.FunctionArguments]: (args, _) => {
      walkNode({
        [Syntax.Pair]: pairNode => {
          const [identifierNode, typeNode] = pairNode.params;
          const withTypeApplied = {
            ...identifierNode,
            type: typeNode.value,
          };
          parseDeclaration(
            false,
            { ...options, locals, closures },
            withTypeApplied,
            _
          );
        },
      })(args);
    },
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
  })({
    ...node,
    type: (() => {
      const typeDef = node.params[1];
      // Identifier, can match Struct type, Function Type or Lambda. Check lambda
      if (
        types[typeDef.value] != null &&
        get(CLOSURE_TYPE, types[typeDef.value])
      ) {
        // Lmbdas are 64-bit Integers when used in source
        return "i64";
      }

      // Everything non-lambda just return the type
      return typeDef.type;
    })(),
    meta: [...node.meta, setMetaFunctionIndex(Object.keys(functions).length)],
    // If we are generating closures for this function, then we need to inject a
    // declaration for the environment local. This local cannot be referenced or
    // changed via source code.
    params: injectEnvironmentMaybe(
      {
        mapFunctionCall: makeFunctionCall({
          ...options,
          locals,
          mapIdentifier: makeMapIdentifier({ locals, ...options }),
          mapSizeof: makeSizeof({ locals, ...options }),
        }),
        ...closures,
      },
      node.params
    ),
  });
  functions[node.value] = fun;

  return [fun, locals, closures];
};

const mapFunctionNode = (options, node, topLevelTransform) => {
  // Initialize our function node
  const [fun, locals, closures] = initialize(options, node);

  // Construct all the mapping functions
  const mapIdentifier = makeMapIdentifier({ ...options, locals });
  const mapArraySubscript = makeArraySubscript({ ...options, locals });
  const mapSizeof = makeSizeof({ ...options, locals });
  const mapAssignment = makeAssignment({ ...options, locals });
  const mapClosure = makeClosure({
    ...options,
    fun,
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

  return mapNode({
    // Patch function arguments so that they mirror locals
    [Syntax.FunctionArguments]: (args, _) => {
      return mapNode({
        [Syntax.Pair]: pairNode => {
          const [identifierNode, typeNode] = pairNode.params;
          return {
            ...pairNode,
            params: [locals[identifierNode.value], typeNode],
          };
        },
      })(args);
    },
    [Syntax.Declaration]: transformClosedDeclaration({
      ...options,
      locals,
      closures,
    }),
    [Syntax.ImmutableDeclaration]: transformClosedDeclaration({
      ...options,
      locals,
      closures,
    }),
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
    // All binary expressions are patched
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
    [Syntax.Closure]: (closure, transform) => {
      const mappedClosure = mapClosure(closure, topLevelTransform);
      const [decl] = mappedClosure.params;
      options.hoist.push(decl);

      return transform(
        collapseClosureIdentifier(
          { ...locals[CLOSURE_BASE], meta: [] },
          mapIdentifier({
            ...decl,
            params: [],
            type: "i32",
            Type: Syntax.Identifier,
            meta: [],
          })
        )
      );
    },
  })(fun);
};

export default curry(mapFunctionNode);
