// @flow
import type { NodeType } from "../flow/types";

type PatchType = NodeType => void;
type WalkerType = (node: NodeType) => void;

// Dead simple AST walker, takes a visitor object and calls all methods for
// appropriate node Types.
function walker(visitor: {
  [string]: (NodeType, PatchType) => void,
}): WalkerType {
  const impl = (node: NodeType, patch = () => {}) => {
    if (node == null) {
      return;
    }
    const { params } = node;

    const paramCount = params.length;

    if ("*" in visitor && typeof visitor["*"] === "function") {
      visitor["*"](node, patch);
    }

    if (node.Type in visitor && typeof visitor[node.Type] === "function") {
      visitor[node.Type](node, patch);
    }

    for (let i = 0; i < paramCount; i++) {
      const currentIndex = i;
      impl(params[i], (newNode: NodeType) => {
        node.params = [
          ...params.slice(0, currentIndex),
          newNode,
          ...params.slice(currentIndex + 1),
        ];
      });
    }
  };

  return impl;
}

export default walker;
