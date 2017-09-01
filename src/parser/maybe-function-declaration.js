import Syntax from '../Syntax';
import {
  generateType,
  generateCode,
  getType
} from './generator';
import statement from './statement';
import declaration from './declaration';

const last = list => list[list.length - 1];

const findTypeIndex = (node, Types) => {
  return Types.findIndex(t => {
    const paramsMatch = t.params.reduce(
      (a, v, i) => node.paramList[i] && a && v === getType(node.paramList[i].type),
      true
    );

    return paramsMatch && t.result === getType(node.result.type);
  });
};

const paramList = (ctx) => {
  const paramList = [];
  ctx.expect(['(']);
  while(ctx.token.value !== ')')
    paramList.push(param(ctx));
  ctx.expect([')']);
  return paramList;
}

const param = (ctx) => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([':']);
  node.type = ctx.expect(null, Syntax.Type).value;
  ctx.eat([',']);
  return ctx.endNode(node, Syntax.Param);
}

const maybeFunctionDeclaration = (ctx) => {
  const node = ctx.startNode();
  if (!ctx.eat(['function']))
    return declaration(ctx);

  ctx.func = node;
  node.func = true;
  node.id = ctx.expect(null, Syntax.Identifier).value;
  node.paramList = paramList(ctx);
  node.locals = [...node.paramList];
  ctx.expect([':']);
  node.result = ctx.expect(null, Syntax.Type).value;
  ctx.expect(['{']);
  node.body = [];
  let stmt = null;
  while(ctx.token && ctx.token.value !== '}') {
    stmt = statement(ctx);
    if (stmt)
      node.body.push(stmt);
  }

  // Sanity check the return statement
  const ret = last(node.body);
  if (ret) {
    if(node.type === 'void' && ret.Type === Syntax.ReturnStatement)
      throw ctx.syntaxError('Unexpected return value in a function with result : void');
    if(node.type !== 'void' && ret.Type !== Syntax.ReturnStatement)
      throw ctx.syntaxError('Expected a return value in a function with result : ' + node.result);
  } else if (node.result){
    throw ctx.syntaxError(`Return type expected ${node.result}, received ${JSON.stringify(ret)}`);
  }

  // Either re-use an existing type or write a new one
  const typeIndex = findTypeIndex(node, ctx.Program.Types);
  if(typeIndex !== -1) {
    node.typeIndex = typeIndex;
  } else {
    node.typeIndex = ctx.Program.Types.length;
    ctx.Program.Types.push(generateType(node));
  }

  // attach to a type index
  node.functionIndex = ctx.Program.Functions.length;
  ctx.Program.Functions.push(node.typeIndex);
  ctx.functions.push(node);

  // generate the code block for the emiter
  ctx.Program.Code.push(generateCode(node));

  ctx.expect(['}']);
  ctx.func = null;

  return ctx.endNode(node, Syntax.FunctionDeclaration);
};

export default maybeFunctionDeclaration;

