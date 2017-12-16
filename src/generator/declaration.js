// @flow
import generateExpression from './expression';
import { generateValueType } from './utils';
import opcode from '../emitter/opcode';
import { get, LOCAL_INDEX } from '../parser/metadata';
import type { GeneratorType } from './flow/types';

const generateDeclaration: GeneratorType = (node, parent) => {
  let block = [];
  const init = node.params[0];
  if (init) {
    init.type = node.type;
    block.push.apply(block, generateExpression(init));
    block.push({
      kind: opcode.SetLocal,
      params: [get(LOCAL_INDEX, node).payload]
    });
  }
  parent.locals.push(generateValueType(node));
  return block;
};

export default generateDeclaration;
