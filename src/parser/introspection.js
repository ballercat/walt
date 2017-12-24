// @flow
import type Context from "./context";
import Syntax from "../Syntax";
import precedence from "./precedence";
import { generateImplicitFunctionType } from "../generator/type";
import { get, LOCAL_INDEX_MAP, localIndex } from "./metadata";
import type { Token, NodeType } from "../flow/types";

export const findTypeIndex = (functionNode: NodeType, ctx: Context): number => {
  const search = generateImplicitFunctionType(functionNode);

  return ctx.Program.Types.findIndex(t => {
    const paramsMatch =
      t.params.length === search.params.length &&
      t.params.reduce((a, v, i) => a && v === search.params[i], true);

    const resultMatch = t.result === search.result;

    return paramsMatch && resultMatch;
  });
};

const findFieldIndex = (fields: string[]) => (
  ctx: Context,
  token: { value: string }
) => {
  let field: any = fields.reduce((memo: ?{}, f) => {
    if (memo) {
      return memo[f];
    }
    return memo;
  }, ctx);

  if (field) {
    return field.findIndex(node => node.id === token.value);
  }

  return -1;
};

export const findLocalIndex = findFieldIndex(["func", "locals"]);
export const findGlobalIndex = (ctx: Context, { value }: { value: string }) =>
  ctx.globals.findIndex(node => node.value === value);
export const findFunctionIndex = (
  ctx: Context,
  { value }: { value: string }
) => {
  return ctx.functions.findIndex(fn => fn.value === value);
};
export const findUserTypeIndex = findFieldIndex(["userTypes"]);

export const findLocalVariable = (
  functionNode: NodeType,
  identifier: { value: string }
): { index: number, node: NodeType } | null => {
  const localIndexMap = get(LOCAL_INDEX_MAP, functionNode);
  if (localIndexMap != null) {
    return localIndexMap.payload[identifier.value];
  }
  return null;
};

export const addFunctionLocal = (
  functionNode: NodeType,
  localNode: NodeType
) => {
  const localIndexMap = get(LOCAL_INDEX_MAP, functionNode);
  if (localIndexMap != null) {
    const { payload } = localIndexMap;
    const localsCount = Object.keys(payload).length;
    localIndexMap.payload = {
      ...localIndexMap.payload,
      [localNode.value]: {
        index: localsCount,
        node: localNode,
      },
    };

    localNode.meta.push(localIndex(localsCount));
  }
};

export const getPrecedence = (token: Token): number => {
  if (token.type === Syntax.UnaryExpression) {
    return precedence["+"];
  }

  return precedence[token.value];
};
export const getAssociativty = (token: Token): "left" | "right" => {
  switch (token.value) {
    case "+":
    case "-":
    case "/":
    case "*":
    case ":":
      return "left";
    case "=":
    case "-=":
    case "+=":
    case "--":
    case "++":
    case "?":
      return "right";
    default:
      return "left";
  }
};
