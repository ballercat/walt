// @flow
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateFunctionPointer: GeneratorType = node => {
  return [
    {
      kind: opcode.i32Const,
      params: [Number(node.value)],
    },
  ];
};

export default generateFunctionPointer;
