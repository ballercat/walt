// @flow
import Syntax from '../Syntax';

import type { NodeType } from '../flow/types';
import type Context from './context';

export default function breakParser(ctx: Context): NodeType {
  const node = ctx.startNode();
  ctx.expect(['break']);
  return ctx.endNode(node, Syntax.Break);
}
