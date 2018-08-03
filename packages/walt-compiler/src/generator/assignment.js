// @flow
import mapSyntax from './map-syntax';
import { setInScope } from './utils';
import mergeBlock from './merge-block';
import type { GeneratorType } from './flow/types';

const generateAssignment: GeneratorType = node => {
  const [target, value] = node.params;
  const block = [value].map(mapSyntax(null)).reduce(mergeBlock, []);

  block.push(setInScope(target));

  return block;
};

export default generateAssignment;
