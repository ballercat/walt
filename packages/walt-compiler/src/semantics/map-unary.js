import Syntax from "../Syntax";
import parse from "../parser";
import expression from "../parser/expression";
import type { NodeType } from "../flow/types";

// Unary expressions need to be patched so that the LHS type matches the RHS
export default function(unaryNode, transform): NodeType {
  const lhs = unaryNode.params[0];
  // Transform bang
  if (unaryNode.value === "!") {
    const newNode = parse(
      `((${lhs.value} >> 31) | ((~${lhs.value} + 1) >> 31)) + 1)`,
      expression
    );
    return transform(newNode);
  }
  if (unaryNode.value === "~") {
    const newNode = parse(`(${lhs.value} ^ 0xFFFFFFFF)`, expression);
    return transform(newNode);
  }

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
}
