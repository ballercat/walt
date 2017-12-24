// @flow
import type Context from "./context";
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

export const findTableIndex = (ctx: Context, functionIndex: number) => {
  return ctx.Program.Element.findIndex(n => n.functionIndex === functionIndex);
};

export const findGlobalIndex = (ctx: Context, { value }: { value: string }) =>
  ctx.globals.findIndex(node => node.value === value);

export const findFunctionIndex = (
  ctx: Context,
  { value }: { value: string }
) => {
  return ctx.functions.findIndex(fn => fn.value === value);
};

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

export const getPrecedence = (token: Token): number => precedence[token.value];

export const getAssociativty = (token: Token): "left" | "right" => {
  switch (token.value) {
    case "=":
    case "-=":
    case "+=":
    case "--":
    case "++":
    case "?":
      return "right";
    case "+":
    case "-":
    case "/":
    case "*":
    case ":":
    default:
      return "left";
  }
};
