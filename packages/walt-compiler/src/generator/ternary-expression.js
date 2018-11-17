// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateTernary: GeneratorType = (node, parent) => {
  // TernaryExpression has a param layout of 3(TWO) total parameters.
  // [truthy, falsy, condition]
  // The whole thing is encoded as an Select opcode
  //
  // NOTE: The use of select means both "branches" are evaluated, even if not selected
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  block.push({
    kind: opcode.Select,
    params: [],
  });

  return block;
};

export default generateTernary;
