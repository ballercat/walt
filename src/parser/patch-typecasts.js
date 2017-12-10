// @flow
import Syntax from "../Syntax";
import invariant from "invariant";
import { typeCast } from "./metadata";
import mapNode from "../utils/map-node";
import printNode from "../utils/print-node";
import type { NodeType } from "../flow/types";

export const isBinaryMathExpression = (node: NodeType): boolean => {
  switch (node.value) {
    case "+":
    case "-":
    case "/":
    case "*":
    case "%":
    case "==":
    case ">":
    case "<":
    case ">=":
    case "<=":
    case "!=":
      return true;
    default:
      return false;
  }
};

export const typeWeight = (typeString: ?string) => {
  switch (typeString) {
    case "i32":
      return 0;
    case "i64":
      return 1;
    case "f32":
      return 2;
    case "f64":
      return 3;
    default:
      return -1;
  }
};

function patchTypeCasts(node: NodeType): NodeType {
  return mapNode({
    [Syntax.Pair]: (typeCastMaybe: NodeType): NodeType => {
      const { params: [targetNode, typeNode] } = typeCastMaybe;
      const { type: from } = targetNode;
      const { value: to } = typeNode;

      // If both sides of a pair don't have types then it's not a typecast,
      // more likely a string: value pair in an object for example
      if (typeNode.Type === Syntax.Type && !!from && !!to) {
        return {
          ...typeCastMaybe,
          type: to,
          value: targetNode.value,
          Type: Syntax.TypeCast,
          meta: [...typeCastMaybe.meta, typeCast({ to, from })],
          // We need to drop the typeNode here, because it's not something we can generate
          params: [targetNode]
        };
      }

      return typeCastMaybe;
    }
  })(node);
}

export const balanceTypesInMathExpression = (
  expression: NodeType
): NodeType => {
  // For top-level pairs, just do a mapping to convert to a typecast
  if (expression.Type === Syntax.Pair) {
    return patchTypeCasts(expression);
  }

  if (isBinaryMathExpression(expression)) {
    // patch any existing type-casts
    const patchedNode = patchTypeCasts(expression);

    // find the result type in the expression
    let type = null;
    patchedNode.params.forEach(({ type: childType }) => {
      // The way we do that is by scanning the top-level nodes in our expression
      if (typeWeight(type) < typeWeight(childType)) {
        type = childType;
      }
    });

    invariant(
      type,
      "Expression missing type parameters %s",
      printNode(patchedNode)
    );

    // iterate again, this time, patching any mis-typed nodes
    const params = patchedNode.params.map(paramNode => {
      invariant(
        paramNode.type,
        "Undefiend type in expression %s",
        printNode(paramNode)
      );

      if (paramNode.type !== type) {
        return {
          ...paramNode,
          type,
          value: paramNode.value,
          Type: Syntax.TypeCast,
          meta: [
            ...paramNode.meta,
            typeCast({ to: type, from: paramNode.type })
          ],
          params: [paramNode]
        };
      }

      return paramNode;
    });

    return {
      ...patchedNode,
      params,
      type
    };
  }

  return expression;
};

export default patchTypeCasts;
