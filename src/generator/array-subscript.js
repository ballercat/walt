//@flow
import opcode from "../emitter/opcode";
import mergeBlock from "./merge-block";
import type { GeneratorType } from "./flow/types";
import mapSyntax from "./map-syntax";

const generateArraySubscript: GeneratorType = (node, parent) => {
  const block = [
    ...node.params.map(mapSyntax(parent)).reduce(mergeBlock, []),
    { kind: opcode.i32Const, params: [4] },
    { kind: opcode.i32Mul, params: [] },
    { kind: opcode.i32Add, params: [] }
  ];

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
