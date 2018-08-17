// @flow
import type { NodeType } from '../flow/types';

export default function hasNode(Type: string, ast: NodeType) {
  const test = node => node && node.Type === Type;

  const walker = node => {
    if (node == null) {
      return false;
    }

    return test(node) || node.params.some(walker);
  };

  return walker(ast);
}
