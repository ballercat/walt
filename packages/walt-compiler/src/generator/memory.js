// @flow
import Syntax from 'walt-syntax';
import walkNode from 'walt-parser-tools/walk-node';
import type { NodeType, IntermediateMemoryType } from './flow/types';

const generateMemory = (node: NodeType): IntermediateMemoryType => {
  const memory = { max: 0, initial: 0 };
  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could produce garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    },
  })(node);

  return memory;
};

export default generateMemory;
