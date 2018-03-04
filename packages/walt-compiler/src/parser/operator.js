// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import closure from "./closure";
import { subscriptFromNode } from "./array-subscript";
import type { TokenType, NodeType } from "../flow/types";

function binary(ctx: Context, op: TokenType, params: NodeType[]) {
  const node: NodeType = { ...params[0] };
  node.value = op.value;
  node.params = params;

  let Type = Syntax.BinaryExpression;
  if (node.value === "=") {
    Type = Syntax.Assignment;
  } else if (node.value === "-=" || node.value === "+=") {
    Type = Syntax.Assignment;
    const value = node.value[0];
    node.value = "=";
    node.params = [
      node.params[0],
      binary(ctx, { ...op, value }, [node.params[0], node.params[1]]),
    ];
  } else if (node.value === "[" || node.value === ".") {
    return subscriptFromNode(ctx, node);
  } else if (node.value === ":") {
    Type = Syntax.Pair;
  } else if (node.value === "||" || node.value === "&&") {
    Type = Syntax.Select;
  }

  return ctx.endNode(node, Type);
}

const unary = (ctx: Context, op: TokenType, params: NodeType[]): NodeType => {
  const [target] = params;
  if (op.value === "--") {
    return {
      ...target,
      Type: Syntax.UnaryExpression,
      value: "-",
      meta: {},
      params: [
        {
          ...target,
          value: "0",
          Type: Syntax.Constant,
          params: [],
          meta: {},
        },
        target,
      ],
    };
  }

  return {
    ...op,
    range: [op.start, target.range[1]],
    meta: {},
    Type: Syntax.Spread,
    params: [target],
  };
};

function objectLiteral(
  ctx: Context,
  op: TokenType,
  params: NodeType[]
): NodeType {
  const node = ctx.startNode(op);
  node.params = params;
  return ctx.endNode(node, Syntax.ObjectLiteral);
}

const ternary = (ctx: Context, op: TokenType, params: NodeType[]) => {
  const node = ctx.startNode(params[0]);
  node.params = params;
  node.value = op.value;
  node.type = params[params.length - 1].type;

  return ctx.endNode(node, Syntax.TernaryExpression);
};

const flattenSequence = (sequence: NodeType[]): NodeType[] => {
  return sequence.reduce((memo, node) => {
    if (node.Type === Syntax.Sequence) {
      memo.push.apply(memo, flattenSequence(node.params));
    } else {
      memo.push(node);
    }

    return memo;
  }, []);
};

// Sequence is a list of comma separated nodes. It's a slighlty special operator
// in that it unrolls any other sequences into it's own params
const sequence = (ctx: Context, op: TokenType, params: NodeType[]) => {
  const node = ctx.startNode(params[0]);
  node.value = op.value;
  node.params = flattenSequence(params);
  return ctx.endNode(node, Syntax.Sequence);
};

// Abstraction for handling operations
const operator = (
  ctx: Context,
  operators: TokenType[],
  operands: NodeType[]
) => {
  const op = operators.pop();
  switch (op.value) {
    case "=>":
      return closure(ctx, op, operands);
    case "?":
      return ternary(ctx, op, operands.splice(-2));
    case ",":
      return sequence(ctx, op, operands.splice(-2));
    case "{":
      return objectLiteral(ctx, op, operands.splice(-1));
    case "--":
    case "...":
    case "sizeof":
      return unary(ctx, op, operands.splice(-1));
    default:
      return binary(ctx, op, operands.splice(-2));
  }
};

export default operator;
