// @flow
import opcode from '../emitter/opcode';
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import type { GeneratorType } from './flow/types';

const generateSelect: GeneratorType = (node, parent) => {
  const [leftHandSide, rightHandSide] = node.params;
  const selectOpcode = { kind: opcode.Select, params: [] };
  const condition = [leftHandSide]
    .map(mapSyntax(parent))
    .reduce(mergeBlock, []);

  if (node.value === '&&') {
    return [
      ...[rightHandSide].map(mapSyntax(parent)).reduce(mergeBlock, []),
      { kind: opcode.i32Const, params: [0] },
      ...condition,
      selectOpcode,
    ];
  }

  return [
    ...condition,
    ...[rightHandSide].map(mapSyntax(parent)).reduce(mergeBlock, []),
    ...condition,
    selectOpcode,
  ];
};

export default generateSelect;
