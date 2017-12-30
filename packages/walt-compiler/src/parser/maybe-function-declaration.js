// @flow
import Syntax from "../Syntax";
import { handleUndefined } from "../utils/generate-error";
import statement from "./statement";
import declaration from "./declaration";
import expression from "./expression";
import mapNode from "../utils/map-node";
import walkNode from "../utils/walk-node";
import {
  make,
  FUNCTION_INDEX,
  userType as setMetaUserType,
  localIndexMap,
} from "./metadata";
import type { NodeType, Metadata } from "../flow/types";
import type Context from "./context";

const last = list => list[list.length - 1];

export const parseArguments = (ctx: Context): NodeType => {
  ctx.expect(["("]);
  ctx.handleUndefinedIdentifier = () => {};
  const argumentsNode = expression(ctx);
  ctx.handleUndefinedIdentifier = handleUndefined(ctx);
  ctx.expect([")"]);

  return mapNode({
    [Syntax.Pair]: pairNode => {
      const [identifierNode, typeNode] = pairNode.params;
      if (typeNode.Type !== Syntax.Type) {
        const functionType = ctx.functionTypes[typeNode.value];
        const userType = ctx.userTypes[typeNode.value];
        const typePointer = functionType || userType;
        const meta = [];

        if (typePointer == null) {
          throw ctx.syntaxError("Undefined Type", typeNode.value);
        }
        if (userType) {
          meta.push(setMetaUserType(userType));
        }

        return {
          ...pairNode,
          params: [
            {
              ...identifierNode,
              type: typePointer.type,
              meta,
            },
            {
              ...typeNode,
              ...typePointer,
              // clear params so we don't recurse into object definition
              params: [],
              type: "i32",
              Type: Syntax.Type,
            },
          ],
        };
      }

      return {
        ...pairNode,
        params: [{ ...identifierNode, type: typeNode.type }, typeNode],
      };
    },
  })(argumentsNode);
};

export const parseFunctionResult = (ctx: Context): NodeType => {
  const baseNode: NodeType = ctx.startNode();
  if (ctx.eat([":"])) {
    return ctx.endNode(
      {
        ...baseNode,
        type: (() => {
          const value = ctx.token.value;
          if (ctx.eat(null, Syntax.Type)) {
            return value === "void" ? null : value;
          }

          return "i32";
        })(),
      },
      Syntax.FunctionResult
    );
  }

  return ctx.endNode(
    {
      ...baseNode,
    },
    Syntax.FunctionResult
  );
};

export const initializeLocals = (argsNode: NodeType): Metadata => {
  const payload = {};
  walkNode({
    [Syntax.Pair]: pairNode => {
      const [identifierNode, typeNode] = pairNode.params;
      const localsCount = Object.keys(payload).length;
      payload[identifierNode.value] = {
        index: localsCount,
        node: identifierNode,
        typeNode,
      };
    },
  })(argsNode);

  return localIndexMap(payload);
};

const maybeFunctionDeclaration = (ctx: Context) => {
  if (!ctx.eat(["function"])) {
    return declaration(ctx);
  }

  const baseNode = ctx.startNode();
  const value = ctx.expect(null, Syntax.Identifier).value;
  const argumentsNode = parseArguments(ctx);
  const localsMetadata = initializeLocals(argumentsNode);
  const resultNode = parseFunctionResult(ctx);

  // NOTE: We need to write function into Program BEFORE
  // we parse the body as the body may refer to the function
  // itself recursively
  // Either re-use an existing type or write a new one

  const emptyNode: NodeType = {
    ...baseNode,
    value,
    type: resultNode.type,
    params: [argumentsNode, resultNode],
    meta: [localsMetadata],
  };
  // const typeIndex = (() => {
  //   const index = findTypeIndex(emptyNode, ctx);
  //   if (index === -1) {
  //     // attach to a type index
  //     ctx.Program.Types.push(generateImplicitFunctionType(emptyNode));
  //     return ctx.Program.Types.length - 1;
  //   }

  //   return index;
  // })();
  const functionIndex = ctx.Program.Functions.length;
  const functionIndexMeta = make(
    {
      get functionIndex() {
        return functionIndex + ctx.functionImports.length;
      },
    },
    FUNCTION_INDEX
  );

  emptyNode.meta = [
    ...emptyNode.meta,
    // setTypeIndex(typeIndex),
    functionIndexMeta,
  ];
  ctx.func = emptyNode;
  ctx.functions.push(emptyNode);

  ctx.expect(["{"]);
  const statements = [];
  while (ctx.token && ctx.token.value !== "}") {
    const stmt = statement(ctx);
    if (stmt) {
      statements.push(stmt);
    }
  }

  // Sanity check the return statement
  const ret = last(statements);
  if (ret && resultNode.type) {
    if (resultNode.type == null && ret.Type === Syntax.ReturnStatement) {
      throw ctx.syntaxError(
        "Unexpected return value in a function with result : void"
      );
    }
    if (resultNode.type != null && ret.Type !== Syntax.ReturnStatement) {
      throw ctx.syntaxError(
        "Expected a return value in a function with result : " +
          JSON.stringify(resultNode.type)
      );
    }
  }

  const node = {
    ...emptyNode,
    params: [...emptyNode.params, ...statements],
  };

  ctx.expect(["}"]);
  ctx.func = null;

  return ctx.endNode(node, Syntax.FunctionDeclaration);
};

export default maybeFunctionDeclaration;
