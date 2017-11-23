import mapSyntax from "./map-syntax";

import mergeBlock from "./merge-block";
import opcode from "../emitter/opcode";

const generateMemoryAssignment = (node, parent) => {
  const block = [
    ...node.params[0].params.map(mapSyntax(parent)).reduce(mergeBlock, []),
    // FIXME: 4 needs to be configurable
    { kind: opcode.i32Const, params: [4] },
    { kind: opcode.i32Mul, params: [] },
    { kind: opcode.i32Add, params: [] }
  ];

  block.push.apply(
    block,
    node.params
      .slice(1)
      .map(mapSyntax(parent))
      .reduce(mergeBlock, [])
  );

  // The last piece is the WASM opcode. Either load or store
  block.push({
    kind: opcode[node.type + "Store"],
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

export default generateMemoryAssignment;
