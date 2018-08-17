// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import { opcodeFromOperator } from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

/**
 * Transform a binary expression node into a list of opcodes
 */
const generateBinaryExpression: GeneratorType = (node, parent) => {
  // Map operands first
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  // Map the operator last
  block.push({
    kind: opcodeFromOperator({
      ...node,
      type: node.type,
    }),
    params: [],
  });

  return block;
};

export default generateBinaryExpression;
