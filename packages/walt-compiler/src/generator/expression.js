// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import type { GeneratorType } from './flow/types';

const generateExpression: GeneratorType = (node, parent) =>
  [node].map(mapSyntax(parent)).reduce(mergeBlock, []);

export default generateExpression;
