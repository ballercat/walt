// @flow
import type { NodeType } from "../flow/types";

const formatMetadata = meta => {
  return meta
    .filter(entry => entry != null)
    .map(({ type, payload }) => {
      let payloadString = "";
      if (typeof payload === "object") {
        payloadString = "...";
      } else {
        payloadString = JSON.stringify(payload);
      }

      return `${type}(${payloadString})`;
    })
    .join(",");
};

const printNode = (node?: NodeType, level: number = 0): string => {
  if (node == null) {
    return "";
  }
  const typeString = `${node.type ? "<" + node.type + ">" : ""}`;
  const metaString = formatMetadata(node.meta);
  let out = `${node.Type}${typeString} ${node.value} ${metaString}\n`;
  out = out.padStart(out.length + level * 2);
  node.params.forEach(p => {
    out += printNode(p, level + 1);
  });
  return out;
};

export default printNode;
