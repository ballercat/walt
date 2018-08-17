// @flow
import type { IntermediateOpcodeType } from './flow/types';

const mergeBlock = (
  block: IntermediateOpcodeType[],
  v: IntermediateOpcodeType | IntermediateOpcodeType[]
): IntermediateOpcodeType[] => {
  // some node types are a sequence of opcodes:
  // nested expressions for example
  if (Array.isArray(v)) {
    block = [...block, ...v];
  } else {
    block.push(v);
  }
  return block;
};

export default mergeBlock;
