import Syntax from '../Syntax'
import functionCall from './function-call';

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx) => {
  const node = ctx.startNode();
  const localIndex = ctx.func.locals.findIndex(l => l.id === ctx.token.value);
  const globalIndex = ctx.globals.findIndex(g => g.id === ctx.token.value);
  const functionIndex = ctx.functions.findIndex(f => f.id === ctx.token.value);
  const isFuncitonCall = ctx.stream.peek().value === '(';

  // Function pointer
  if (!isFuncitonCall && localIndex < 0 && globalIndex < 0 && functionIndex > -1) {
    // Save the element
    ctx.writeFunctionPointer(functionIndex);
    // Encode a function pointer as a i32.const representing the function index
    const tableIndex = ctx.Program.Element.findIndex(e => e.functionIndex === functionIndex);
    node.value = tableIndex;
    return ctx.endNode(node, Syntax.Constant);
  } else if (isFuncitonCall) {
    // if function call then encode it as such
    return functionCall(ctx);
  }

  // Not a function call or pointer, look-up variables
  if (localIndex !== -1) {
    node.localIndex = localIndex;
    node.target = ctx.func.locals[localIndex];
    node.type = node.target.type;
  } else if (globalIndex !== -1) {
    node.globalIndex = globalIndex;
    node.target = ctx.globals[node.globalIndex];
    node.type = node.target.type;
  }

  ctx.diAssoc = 'left';
  return ctx.endNode(node, Syntax.Identifier);
}

export default maybeIdentifier;
