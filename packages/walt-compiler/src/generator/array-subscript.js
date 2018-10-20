// @flow
import opcode from '../emitter/opcode';
import mergeBlock from './merge-block';
import type { GeneratorType } from './flow/types';
import { TYPE_ARRAY } from '../semantics/metadata';
import mapSyntax from './map-syntax';

const generateArraySubscript: GeneratorType = (node, parent) => {
  const identifier = node.params[0];
  const type = identifier.meta[TYPE_ARRAY];
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  // For array types, the index is multiplied by the contained object size
  block.push.apply(block, [
    { kind: opcode.i32Const, params: [2] },
    { kind: opcode.i32Shl, params: [] },
  ]);

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: opcode.i32Add, params: [] });

  block.push({
    kind: opcode[String(type) + 'Load'],
    params: [
      // Alignment
      2,
      // Memory. Always 0 in the WASM MVP
      0,
    ],
    debug: `${identifier.value} : ${JSON.stringify(identifier.type)}`,
  });

  return block;
};

export default generateArraySubscript;
