// @flow
import Syntax from '../Syntax';
import type { NodeType } from '../flow/types';
import type Context from './context';

export const subscriptFromNode = (ctx: Context, node: NodeType): NodeType => {
  const [identifier] = node.params;

  return ctx.endNode(
    { ...node, value: identifier.value },
    Syntax.ArraySubscript
  );
};
