import Syntax from "../Syntax";
import { expressionFragment } from "../parser/fragment";
import type { NodeType } from "../flow/types";

const toString = node => {
  if (node.Type === Syntax.ArraySubscript) {
    return `${node.params[0].value}.${node.params[1].value}`;
  }

  return node.value;
};

// Unary expressions need to be patched so that the LHS type matches the RHS
export default function(unaryNode, transform): NodeType {
  const lhs = unaryNode.params[0];
  // Transform bang
  if (unaryNode.value === "!") {
    const value = toString(lhs);
    const shift = ["i64", "f64"].includes(transform(lhs).type) ? "63" : "31";
    const fragment = expressionFragment(
      `((${value} >> ${shift}) | ((~${value} + 1) >> ${shift})) + 1)`
    );
    return transform(fragment);
  }
  if (unaryNode.value === "~") {
    const mask = ["i64", "f64"].includes(transform(lhs).type)
      ? "0xffffffffffff"
      : "0xffffff";
    const fragment = expressionFragment(`${toString(lhs)} ^ ${mask}`);
    return transform(fragment);
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
