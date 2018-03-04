// @flow
import mapSyntax from "./map-syntax";
import opcode from "../emitter/opcode";
import mergeBlock from "./merge-block";
import invariant from "invariant";
import printNode from "../utils/print-node";
import { get, FUNCTION_INDEX } from "../semantics/metadata";
import type { GeneratorType } from "./flow/types";

const generateFunctionCall: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const metaFunctionIndex = get(FUNCTION_INDEX, node);
  invariant(
    metaFunctionIndex != null,
    "Undefined function index for node \n" + `${printNode(node)}`
  );

  block.push({
    kind: opcode.Call,
    params: [metaFunctionIndex],
    debug: `${node.value}<${node.type ? node.type : "void"}>`,
  });

  return block;
};

export default generateFunctionCall;
