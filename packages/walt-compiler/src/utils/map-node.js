// @flow
import type { NodeType } from "../flow/types";

type WalkerType = (node: NodeType, childMapper?: any) => NodeType;
type VisitorType = { [string]: WalkerType };

export default function mapNode(visitor: VisitorType): WalkerType {
  const nodeMapper = (node: NodeType): NodeType => {
    if (node == null) {
      return node;
    }

    const mappingFunction: WalkerType = (() => {
      if ("*" in visitor && typeof visitor["*"] === "function") {
        return visitor["*"];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === "function") {
        return visitor[node.Type];
      }
      return identity => identity;
    })();

    if (mappingFunction.length === 2) {
      return mappingFunction(node, nodeMapper);
    }

    const mappedNode = mappingFunction(node);
    const params = mappedNode.params.map(nodeMapper);

    return {
      ...mappedNode,
      params,
    };
  };

  return nodeMapper;
}
