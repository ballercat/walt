import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";

const generateSequence = (node, parent) => {
  return node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
};

export default generateSequence;
