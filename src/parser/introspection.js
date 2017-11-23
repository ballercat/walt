// @flow
import Context from "./context";
import { getType } from "../generator/utils";
import Syntax from "../Syntax";
import precedence from "./precedence";
import type { Token, Node } from "../flow/types";

export const findTypeIndex = (node: Node, ctx: Context): number => {
  return ctx.Program.Types.findIndex(t => {
    const paramsMatch =
      t.params.length === node.params.length &&
      t.params.reduce(
        (a, v, i) => node.params[i] && a && v === getType(node.params[i].type),
        true
      );

    const resultMatch =
      t.result == node.result ||
      (node.result && t.result === getType(node.result.type));

    return paramsMatch && resultMatch;
  });
};

const findFieldIndex = (fields: string[]) => (ctx: Context, token: Token) => {
  let field: any = fields.reduce((memo, f) => {
    if (memo) return (memo: Object)[f];
    return memo;
  }, ctx);

  if (field) {
    return field.findIndex(node => node.id === token.value);
  }

  return -1;
};

export const findLocalIndex = findFieldIndex(["func", "locals"]);
export const findGlobalIndex = findFieldIndex(["globals"]);
export const findFunctionIndex = findFieldIndex(["functions"]);
export const findUserTypeIndex = findFieldIndex(["userTypes"]);

// FIXME: do all of this inline here
// FIXME: add a symbol for function call
export const getPrecedence = (token: Token): number => {
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
    case "--":
    case "++":
    case "?":
      return "right";
    default:
      return "left";
  }
};
