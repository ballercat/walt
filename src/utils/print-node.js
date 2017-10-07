// @flow
import type { Node } from "../flow/types";

const printNode = (node: Node, level: number = 0): string => {
  const typeString = `${node.type ? "<" + node.type + ">" : ""}`;
  const metaString = `(${node.meta.map(JSON.stringify).join(",")})`;
  let out = `${node.Type}${typeString} ${node.value} ${metaString}\n`;
  out = out.padStart(out.length + level * 2);
  node.params.forEach(p => (out += printNode(p, level + 1)));
  return out;
};

export default printNode;
