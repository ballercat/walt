// @flow
import { i32 } from 'walt-syntax';
import generateExpression from './expression';
import { isBuiltinType } from './utils';
import opcode from '../emitter/opcode';
import { LOCAL_INDEX } from '../semantics/metadata';
import type { GeneratorType } from './flow/types';

const generateDeclaration: GeneratorType = (node, parent) => {
  const initNode = node.params[0];

  if (initNode) {
    const metaIndex = node.meta[LOCAL_INDEX];

    const type = isBuiltinType(node.type) ? node.type : i32;

    return [
      ...generateExpression({ ...initNode, type }, parent),
      {
        kind: opcode.SetLocal,
        params: [metaIndex],
        debug: `${node.value}<${String(node.type)}>`,
      },
    ];
  }

  return [];
};

export default generateDeclaration;
