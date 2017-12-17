// @flow
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import opcode from "../emitter/opcode";
import type { Node } from "../flow/types";
import type { GeneratorType } from "./flow/types";

const generateIndirectFunctionCall: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  block.push({
    kind: opcode.CallIndirect,
    params: [node.typeIndex, { kind: opcode.Nop, params: [] }],
  });

  return block;
};

export default generateIndirectFunctionCall;
