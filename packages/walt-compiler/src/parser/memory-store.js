// @flow
import invariant from 'invariant';
import Syntax from '../Syntax';
import expression from './expression';
import type Context from './context';
import type { NodeType } from '../flow/types';

// Parse the expression and set the appropriate Type for the generator
const memoryStore = (ctx: Context): NodeType => {
  // Parse the assignment
  const node = expression(ctx);

  invariant(
    node.params.length > 0,
    'Memory Store expression could not be parsed'
  );

  const type = node.params[0].type;

  return ctx.endNode({ ...node, type }, Syntax.MemoryAssignment);
};

export default memoryStore;
