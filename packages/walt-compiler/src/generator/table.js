// @flow
import Syntax from 'walt-syntax';
import walkNode from 'walt-parser-tools/walk-node';
import type { NodeType, IntermediateTableType } from './flow/types';

export default function generateMemory(node: NodeType): IntermediateTableType {
  const table = { max: 0, initial: 0, type: '' };

  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could produce garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      if (key === 'initial') {
        table.initial = parseInt(value);
      } else if (key === 'element') {
        table.type = value;
      } else if (key === 'max') {
        table.max = parseInt(value);
      }
    },
  })(node);

  return table;
}
