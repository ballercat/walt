// @flow
import type { NodeType } from "../flow/types";

type WalkerType = (node: NodeType) => NodeType;
type VisitorType = { [string]: WalkerType };

export default function mapNode (visitor: VisitorType): WalkerType {
  const impl = (node: NodeType): NodeType => {
    if (node == null) {
      return node;
    }

    const mappedNode = (() => {
      if ("*" in visitor && typeof visitor["*"] === "function") {
        return visitor["*"](node);
      }

      if (node.Type in visitor && typeof visitor[node.Type] === "function") {
        return visitor[node.Type](node);
      }
      return node;
    })();

    const params = mappedNode.params.map(impl);

    return {
      ...mappedNode,
      params,
    };
  };

  return impl;
}
