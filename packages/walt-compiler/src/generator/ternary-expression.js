// @flow
import mapSyntax from './map-syntax';
import { generateValueType } from './utils';
import mergeBlock from './merge-block';
import opcode, { opcodeFromOperator } from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateTernary: GeneratorType = (node, parent) => {
  // TernaryExpression has a simple param layout of 2(TWO) total parameters.
  // It's a single param for the boolean check followed by
  // another param which is a Pair Node containing the 2(TWO) param results of
  // true and false branches.
  // The whole thing is encoded as an implicitly returned if/then/else block.
  const mapper = mapSyntax(parent);
  const resultPair = node.params[1];

  // Truthy check
  const block = node.params
    .slice(0, 1)
    .map(mapper)
    .reduce(mergeBlock, []);

  // If Opcode
  block.push({
    kind: opcodeFromOperator(node),
    valueType: generateValueType(node),
    params: [],
  });

  // Map the true branch
  block.push.apply(
    block,
    resultPair.params
      .slice(0, 1)
      .map(mapper)
      .reduce(mergeBlock, [])
  );
  block.push({
    kind: opcodeFromOperator({ value: ':', type: 'i32' }),
    params: [],
  });

  // Map the false branch
  block.push.apply(
    block,
    resultPair.params
      .slice(-1)
      .map(mapper)
      .reduce(mergeBlock, [])
  );

  // Wrap up the node
  block.push({ kind: opcode.End, params: [] });

  return block;
};

export default generateTernary;
