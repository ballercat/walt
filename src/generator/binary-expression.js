import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import { opcodeFromOperator } from "../emitter/opcode";
/**
 * Transform a binary expression node into a list of opcodes
 */
const generateBinaryExpression = (node, parent) => {
  // Map operands first
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  // Map the operator last
  block.push({
    kind: opcodeFromOperator(node)
  });

  return block;
};

export default generateBinaryExpression;
