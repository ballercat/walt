// @flow
import Syntax from '../Syntax';
import maybeFunctionDeclaration from './maybe-function-declaration';
import parseTypeDef from './type';
import type { NodeType } from '../flow/types';
import type Context from './context';

export default function parseExport(ctx: Context): NodeType {
  const node = ctx.startNode();
  ctx.eat(['export']);

  if (ctx.token.value === 'type') {
    const typedef = parseTypeDef(ctx);
    return ctx.endNode(
      {
        ...node,
        params: [typedef],
      },
      Syntax.Export
    );
  }
  const params = [maybeFunctionDeclaration(ctx)];

  return ctx.endNode({ ...node, params }, Syntax.Export);
}
