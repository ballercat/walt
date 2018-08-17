// @flow
import invariant from 'invariant';
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import { LOCAL_INDEX, TYPE_INDEX } from '../semantics/metadata';
import type { GeneratorType } from './flow/types';

const generateIndirectFunctionCall: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const localIndex = node.meta[LOCAL_INDEX];
  const typeIndexMeta = node.meta[TYPE_INDEX];
  invariant(
    localIndex != null,
    'Undefined local index, not a valid function pointer'
  );
  invariant(
    typeIndexMeta != null,
    'Variable is not of a valid function pointer type'
  );

  return [
    ...block,
    {
      kind: opcode.CallIndirect,
      params: [typeIndexMeta, 0],
    },
  ];
};

export default generateIndirectFunctionCall;
