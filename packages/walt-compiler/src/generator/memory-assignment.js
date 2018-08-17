// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import { TYPE_ARRAY } from '../semantics/metadata';
import type { GeneratorType } from './flow/types';

const generateMemoryAssignment: GeneratorType = (node, parent) => {
  const targetNode = node.params[0];
  const isArray = targetNode.params[0].meta[TYPE_ARRAY];
  let type = node.type;

  const block = node.params[0].params
    .map(mapSyntax(parent))
    .reduce(mergeBlock, []);

  if (isArray != null) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [
      // TODO: fix this for user-defined types
      { kind: opcode.i32Const, params: [2] },
      { kind: opcode.i32Shl, params: [] },
    ]);
    type = isArray;
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: opcode.i32Add, params: [] });

  block.push.apply(
    block,
    node.params
      .slice(1)
      .map(mapSyntax(parent))
      .reduce(mergeBlock, [])
  );

  // The last piece is the WASM opcode. Either load or store
  block.push({
    kind: opcode[String(type) + 'Store'],
    params: [
      // Alignment
      // TODO: make this extendible
      2,
      // Memory. Always 0 in the WASM MVP
      0,
    ],
  });

  return block;
};

export default generateMemoryAssignment;
