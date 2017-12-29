// @flow
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import type { NodeType } from "./flow/types";

const generateMemory = (node: NodeType): { max: number, initial: number } => {
  const memory = { max: 0, initial: 0 };

  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could procude garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    },
  })(node);

  return memory;
};

export default generateMemory;
