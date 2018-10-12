// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateReturn: GeneratorType = node => {
  // Postfix in return statement should be a no-op UNLESS it's editing globals
  const block = node.params
    .filter(Boolean)
    .map(mapSyntax(null))
    .reduce(mergeBlock, []);
  block.push({ kind: opcode.Return, params: [] });

  return block;
};

export default generateReturn;
