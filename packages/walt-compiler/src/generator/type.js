// @flow
/**
 * Generate an Intermediate version for a WebAssembly function type
 **/
import invariant from "invariant";
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import generateError from "../utils/generate-error";
import { I32, F32, F64, I64 } from "../emitter/value_type";
import type { IntermediateTypeDefinitionType, NodeType } from "./flow/types";

// clean this up
export const getType = (str: string): number => {
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

export const generateImplicitFunctionType = (
  functionNode: NodeType
): IntermediateTypeDefinitionType => {
  const [argsNode, resultNode] = functionNode.params;
  const resultType = resultNode.type ? getType(resultNode.type) : null;

  const params = [];
  walkNode({
    [Syntax.Pair]: pairNode => {
      const typeNode = pairNode.params[1];
      invariant(typeNode, "Undefined type in a argument expression");
      params.push(getType(typeNode.value));
    },
  })(argsNode);

  return {
    params,
    result: resultType,
    id: functionNode.value,
  };
};

export default function generateType(
  node: NodeType
): IntermediateTypeDefinitionType {
  const id = node.value;
  invariant(
    typeof id === "string",
    `Generator: A type must have a valid string identifier, node: ${JSON.stringify(
      node
    )}`
  );

  const typeExpression = node.params[0];
  if (typeExpression.Type !== Syntax.Closure) {
    const [start, end] = node.range;
    throw new SyntaxError(
      generateError(
        "Invalid type syntax",
        "A function type must be of form (<type>, ...) <type>",
        { start, end },
        "",
        ""
      )
    );
  }

  // Collect the function params and result by walking the tree of nodes
  const params = [];
  let result = null;
  const left = typeExpression.params[0];
  const right = typeExpression.params[1];

  // if we do not have a right node, then we do not have any params for this function
  // type, so we just skip this.
  if (right != null) {
    walkNode({
      [Syntax.Type]: ({ value: typeValue }) => params.push(getType(typeValue)),
    })(left);
  }

  walkNode({
    [Syntax.Type]: ({ value: typeValue }) => {
      result = typeValue && typeValue !== "void" ? getType(typeValue) : null;
    },
  })(right || left);

  return {
    id,
    params,
    result,
  };
}
