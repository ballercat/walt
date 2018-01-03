// @flow
import type { NodeType } from "../flow/types";

type WalkerType = (node: NodeType) => void;

// Dead simple AST walker, takes a visitor object and calls all methods for
// appropriate node Types.
function walker(visitor: { [string]: (NodeType) => void }): WalkerType {
  const walkNode = (node: NodeType) => {
    if (node == null) {
      return;
    }
    const { params } = node;

    if ("*" in visitor && typeof visitor["*"] === "function") {
      visitor["*"](node);
    }

    if (node.Type in visitor && typeof visitor[node.Type] === "function") {
      visitor[node.Type](node);
    }

    params.forEach(walkNode);
  };

  return walkNode;
}

export default walker;
