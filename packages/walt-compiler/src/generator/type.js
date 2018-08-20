// @flow
/**
 * Generate an Intermediate version for a WebAssembly function type
 **/
import invariant from 'invariant';
import Syntax from 'walt-syntax';
import walkNode from 'walt-parser-tools/walk-node';
import { I32, F32, F64, I64 } from '../emitter/value_type';
import type { IntermediateTypeDefinitionType, NodeType } from './flow/types';

// clean this up
export const getType = (str: string): number => {
  switch (str) {
    case 'f32':
      return F32;
    case 'f64':
      return F64;
    case 'i64':
      return I64;
    case 'i32':
    case 'Function':
    default:
      return I32;
  }
};

export const generateImplicitFunctionType = (
  functionNode: NodeType
): IntermediateTypeDefinitionType => {
  const [argsNode] = functionNode.params;
  const resultType = functionNode.type ? getType(functionNode.type) : null;

  const params = [];
  walkNode({
    [Syntax.Pair]: pairNode => {
      const typeNode = pairNode.params[1];
      invariant(typeNode, 'Undefined type in a argument expression');
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
    typeof id === 'string',
    `Generator: A type must have a valid string identifier, node: ${JSON.stringify(
      node
    )}`
  );

  const [args, result] = node.params;

  // Collect the function params and result by walking the tree of nodes
  const params = [];

  walkNode({
    [Syntax.Type]: (t, __) => {
      params.push(getType(t.value));
    },
    // Generate Identifiers as UserType pointers, so i32s
    [Syntax.Identifier]: (t, __) => {
      params.push(getType(t.value));
    },
  })(args);

  return {
    id,
    params,
    result: result.type && result.type !== 'void' ? getType(result.type) : null,
  };
}
