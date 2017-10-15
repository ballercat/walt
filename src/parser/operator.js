// @flow
import Syntax from "../Syntax";
import Context from "./context";
import metadata from "./metadata";
import functionCall from "./function-call";
import { getAssociativty } from "./introspection";
import type { Token, Node } from "../flow/types";

function binary(ctx: Context, op: Token, params: Node[]) {
  const node: Node = ctx.startNode(params[0]);
  node.value = op.value;
  node.params = params;
  // FIXME: type of the binary expression should be more accurate
  node.type = params[0] ? params[0].type || "i32" : "void";

  ctx.diAssoc = "left";
  let Type = Syntax.BinaryExpression;
  if (node.value === "=") {
    Type = Syntax.Assignment;
    ctx.diAssoc = "right";
  } else if (node.value === "[") {
    Type = Syntax.ArraySubscript;
  } else if (node.value === ":") {
    Type = Syntax.Pair;
  }

  return ctx.endNode(node, Type);
}

function unary(ctx: Context, op: Token, params: Node[]) {
  // Since WebAssembly has no 'native' support for incr/decr _opcode_ it's much simpler to
  // convert this unary to a binary expression by throwing in an extra operand of 1
  if (op.value === "--" || op.value === "++") {
    const newParams = [
      ...params,
      ctx.makeNode(
        {
          value: "1"
        },
        Syntax.Constant
      )
    ];
    const newOperator = binary(ctx, { ...op }, newParams);
    newOperator.meta.push(metadata.postfix(true));
    newOperator.value = op.value[0];
    return newOperator;
  }
  const node = ctx.startNode(params[0]);
  node.params = params;
  node.value = op.value;

  return ctx.endNode(node, Syntax.UnaryExpression);
}

function objectLiteral(ctx: Context, op: Token, params: Node[]): Node {
  const node = ctx.startNode(op);
  node.params = params;
  return ctx.endNode(node, Syntax.ObjectLiteral);
}

const ternary = (ctx: Context, op: Token, params: Node[]) => {
  const node = ctx.startNode(params[0]);
  node.params = params;
  node.value = op.value;
  node.type = params[params.length - 1].type;

  return ctx.endNode(node, Syntax.TernaryExpression);
};

const flattenSequence = (sequence: Node[]): Node[] => {
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
const sequence = (ctx: Context, op: Token, params: Node[]) => {
  const node = ctx.startNode(params[0]);
  node.value = op.value;
  node.params = flattenSequence(params);
  node.type = op.type;
  return ctx.endNode(node, Syntax.Sequence);
};

// Abstraction for handling operations
const operator = (ctx: Context, op: Token, operands: Node[]) => {
  switch (op.value) {
    case "++":
    case "--":
      return unary(ctx, op, operands.splice(-1));
    case "?":
      return ternary(ctx, op, operands.splice(-2));
    case ",":
      return sequence(ctx, op, operands.slice(-2));
    case "{":
      return objectLiteral(ctx, op, operands.splice(-1));
    default:
      if (op.type === Syntax.FunctionCall)
        return functionCall(ctx, op, operands);
      return binary(ctx, op, operands.splice(-2));
  }
};

export default operator;
