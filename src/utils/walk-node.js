// @flow
import type { Node } from "../flow/types";

type Walker = (node: Node) => void;

// Dead simple AST walker, takes a visitor object and calls all methods for
// appropriate node Types.
function walker(visitor: any): Walker {
  const impl = (node: Node) => {
    if (node == null) {
      return;
    }

    const paramCount = node.params.length;

    if ("*" in visitor && typeof visitor["*"] === "function") {
      visitor["*"](node);
    }

    if (node.Type in visitor && typeof visitor[node.Type] === "function") {
      visitor[node.Type](node);
    }

    for (let i = 0; i < paramCount; i++) {
      impl(node.params[i]);
    }
  };

  return impl;
}

export default walker;
