//@flow
import invariant from "invariant";
import opcode from "../emitter/opcode";
import mergeBlock from "./merge-block";
import { nodeMetaType } from "../parser/array-subscript";
import type { GeneratorType } from "./flow/types";
import mapSyntax from "./map-syntax";
import { TYPE_ARRAY } from "../parser/metadata";

const generateArraySubscript: GeneratorType = (node, parent) => {
  const metaType = nodeMetaType(node);
  invariant(
    metaType,
    `Cannot generate subscript on an non-indexable node ${JSON.stringify(node)}`
  );
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  if (metaType.type === TYPE_ARRAY) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [
      // TODO: fix this for user-defined types
      { kind: opcode.i32Const, params: [4] },
      { kind: opcode.i32Mul, params: [] }
    ]);
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: opcode.i32Add, params: [] });

  // The last piece is the WASM opcode. Either load or store
  const nodeType = node.type || "i32";

  block.push({
    kind: opcode[nodeType + "Load"],
    params: [
      // Alignment
      // TODO: make this extendible
      2,
      // Memory. Always 0 in the WASM MVP
      0
    ]
  });

  return block;
};

export default generateArraySubscript;
