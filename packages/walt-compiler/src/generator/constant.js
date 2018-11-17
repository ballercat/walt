// @flow
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateConstant: GeneratorType = node => {
  const kind = opcode[String(node.type) + 'Const'];
  const value = (node.meta.SIGN || 1) * Number(node.value);

  return [
    {
      kind,
      params: [value],
    },
  ];
};

export default generateConstant;
