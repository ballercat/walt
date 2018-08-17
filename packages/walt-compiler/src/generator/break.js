// @flow
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';
const generateTypecast: GeneratorType = () => {
  return [
    {
      kind: opcode.Br,
      params: [2],
    },
  ];
};

export default generateTypecast;
