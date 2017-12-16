//@flow
/**
 * Generate an Intermediate version for a WebAssembly function type
 **/
import invariant from "invariant";
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import printNode from "../utils/print-node";
import type { NodeType } from "../flow/types";
import { I32, F32, F64, I64 } from "../emitter/value_type";
import type { IntermediateTypeDefinitionType } from "./flow/types";

// clean this up
export const getType = (str: ?string): number => {
  switch (str) {
    case "f32":
      return F32;
    case "f64":
      return F64;
    case "i64":
      return I64;
    case "i32":
    case "Function":
    default:
      return I32;
  }
};

export const generateImplicitFunctionType = ({
  params,
  id,
  result
}: NodeType): IntermediateTypeDefinitionType => {
  return {
    params: params.map(({ type }) => getType(type)),
    result: result && result !== "void" ? getType(result) : null,
    id
  };
};

export default function generateType(
  node: NodeType
): IntermediateTypeDefinitionType {
  invariant(
    typeof node.id === "string",
    `Generator: A type must have a valid string identifier, node: ${JSON.stringify(
      node
    )}`
  );

  const typeExpression = node.params[0];
  invariant(
    typeExpression && typeExpression.Type === Syntax.BinaryExpression,
    `Generator: A function type must be of form (<type>, ...) => <type> node: ${printNode(
      node
    )}`
  );

  // Collect the function params and result by walking the tree of nodes
  const params = [];
  let result = null;
  const left = typeExpression.params[0];
  const right = typeExpression.params[1];

  // if we do not have a right node, then we do not have any params for this function
  // type, so we an just skip this.
  if (right != null) {
    walkNode({
      [Syntax.Type]: ({ value: typeValue }) => params.push(getType(typeValue))
    })(left);
  }

  walkNode({
    [Syntax.Type]: ({ value: typeValue }) => {
      result = typeValue !== "void" ? getType(typeValue) : null;
    }
  })(right || left);

  return {
    id: node.id,
    params,
    result
  };
}
