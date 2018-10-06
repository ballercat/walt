// @flow
import mergeBlock from './merge-block';
import mapSyntax from './map-syntax';
import { textMap } from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const alignCodes = {
  load8_s: 0,
  load8_u: 0,
  store8: 0,
  load16_s: 1,
  load16_u: 1,
  store16: 1,
  store32: 2,
  load32_s: 2,
  load32_u: 2,
  store: 2,
  load: 2,
};

const immediates = {
  grow_memory: 0,
  current_memory: 0,
};

const generateNative: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  const operation = node.value.split('.').pop();

  if (alignCodes[operation] == null) {
    block.push({ kind: textMap[node.value], params: [immediates[node.value]] });
  } else {
    const alignment = alignCodes[operation];

    const params = [alignment, 0];

    block.push({ kind: textMap[node.value], params });
  }

  return block;
};

export default generateNative;
