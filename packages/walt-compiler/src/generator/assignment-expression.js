// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateAssignment: GeneratorType = node => {
  const [target, value] = node.params;
  const block = [value].map(mapSyntax(null)).reduce(mergeBlock, []);

  block.push({
    kind: opcode.TeeLocal,
    params: [Number(target.meta.LOCAL_INDEX)],
    debug: `${target.value}<${String(target.meta.ALIAS || target.type)}>`,
  });

  return block;
};

export default generateAssignment;
