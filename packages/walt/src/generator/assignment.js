// @flow
import mapSyntax from "./map-syntax";
import { setInScope } from "./utils";
import mergeBlock from "./merge-block";
import type { GeneratorType } from "./flow/types";

const generateAssignment: GeneratorType = node => {
  const block = node.params
    .slice(1)
    .map(mapSyntax(null))
    .reduce(mergeBlock, []);

  block.push(setInScope(node.params[0]));

  return block;
};

export default generateAssignment;
