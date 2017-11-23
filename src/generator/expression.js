//@flow
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import type { GeneratorType } from "./flow/types";

const generateExpression: GeneratorType = (node, parent) => {
  const block = [node].map(mapSyntax(parent)).reduce(mergeBlock, []);
  return block;
};

export default generateExpression;
