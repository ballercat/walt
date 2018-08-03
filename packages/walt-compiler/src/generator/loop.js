// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

const generateLoop: GeneratorType = (node, parent) => {
  const block = [];
  const mapper = mapSyntax(parent);

  // First param in a for loop is assignment expression or Noop if it's a while loop
  const [initializer, condition, ...body] = node.params;

  block.push.apply(block, [initializer].map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.Block, params: [0x40] });
  block.push({ kind: opcode.Loop, params: [0x40] });

  block.push.apply(block, [condition].map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.i32Eqz, params: [] });
  block.push({ kind: opcode.BrIf, params: [1] });

  block.push.apply(block, body.map(mapper).reduce(mergeBlock, []));

  block.push({ kind: opcode.Br, params: [0] });

  block.push({ kind: opcode.End, params: [] });
  block.push({ kind: opcode.End, params: [] });

  return block;
};

export default generateLoop;
