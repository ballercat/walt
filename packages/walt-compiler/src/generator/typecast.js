// @flow
//
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import { getTypecastOpcode } from '../emitter/opcode';
import { TYPE_CAST } from '../semantics/metadata';
import invariant from 'invariant';
import type { GeneratorType } from './flow/types';

const generateTypecast: GeneratorType = (node, parent) => {
  const metaTypecast = node.meta[TYPE_CAST];
  invariant(
    metaTypecast,
    `Cannot generate typecast for node: ${JSON.stringify(node)}`
  );

  const { to, from } = metaTypecast;

  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  return [
    ...block,
    {
      kind: getTypecastOpcode(to, from),
      params: [],
    },
  ];
};

export default generateTypecast;
