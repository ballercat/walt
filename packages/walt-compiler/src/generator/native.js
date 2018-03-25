// @flow
import mergeBlock from "./merge-block";
import mapSyntax from "./map-syntax";
import { textMap } from "../emitter/opcode";
import type { GeneratorType } from "./flow/types";

const generateNative: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  const operation = node.value.split(".")[1];
  const params = [2, 0];
  if (operation.indexOf("load8") > -1) {
    params[0] = 0;
  }

  block.push({ kind: textMap[node.value], params });

  return block;
};

export default generateNative;
