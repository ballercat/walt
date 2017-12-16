// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import type { GeneratorType } from './flow/types';

const generateSequence: GeneratorType = (node, parent) => {
  return node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
};

export default generateSequence;
