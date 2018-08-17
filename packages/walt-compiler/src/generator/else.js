// @flow
import opcode from '../emitter/opcode';
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import type { GeneratorType } from './flow/types';

const generateElse: GeneratorType = (node, parent) => {
  // TODO: blocks should encode a return type and an end opcode,
  // but currently they are only used as part of a larger control flow instructions
  return [
    { kind: opcode.Else, params: [] },
    ...node.params.map(mapSyntax(parent)).reduce(mergeBlock, []),
  ];
};

export default generateElse;
