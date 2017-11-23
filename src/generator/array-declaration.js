import generateExpression from "./expression";
import { generateValueType } from "./utils";
import opcode from "../emitter/opcode";

const generateArrayDeclaration = (node, parent) => {
  const block = [];
  if (node.init) {
    block.push.apply(block, generateExpression(node.init));
    block.push({ kind: opcode.SetLocal, params: [node.localIndex] });
  }
  parent.locals.push(generateValueType(node));
  return block;
};

export default generateArrayDeclaration;
