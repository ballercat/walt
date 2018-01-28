// @flow
import opcode from "../emitter/opcode";
import mergeBlock from "./merge-block";
import type { GeneratorType } from "./flow/types";
import { get, TYPE_ARRAY } from "../semantics/metadata";
import mapSyntax from "./map-syntax";

const generateArraySubscript: GeneratorType = (node, parent) => {
  const identifier = node.params[0];
  const isArray = get(TYPE_ARRAY, identifier);
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  let type = node.type;

  if (isArray != null) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [
      // TODO: fix this for user-defined types
      { kind: opcode.i32Const, params: [4] },
      { kind: opcode.i32Mul, params: [] },
    ]);
    type = isArray.payload;
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: opcode.i32Add, params: [] });

  block.push({
    kind: opcode[(type || "i32") + "Load"],
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

export default generateArraySubscript;
