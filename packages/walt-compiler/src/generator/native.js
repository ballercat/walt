// @flow
import mergeBlock from './merge-block';
import mapSyntax from './map-syntax';
import { textMap } from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateNative: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  const operation = node.value.split('.').pop();
  if (operation === 'clz') {
    block.push({ kind: textMap[node.value], params: [] });
  } else {
    const alignment = (() => {
      switch (operation) {
        case 'load8_s':
        case 'load8_u':
        case 'store8':
          return 0;
        case 'load16_s':
        case 'load16_u':
        case 'store16':
          return 1;
        // "store32" as well
        default:
          return 2;
      }
    })();

    const params = [alignment, 0];

    block.push({ kind: textMap[node.value], params });
  }

  return block;
};

export default generateNative;
