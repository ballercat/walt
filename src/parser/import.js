// @flow
import Syntax from '../Syntax';
import Context from './context';
import {
  getType,
  generateType,
  generateImport
} from './generator';

import type { TypeNode } from './node';

export type Field = {
  id: string,
  global?: number,
  typeIndex?: number,
  functionIndex?: number
};
export type Import = {
  fields: Field[]
};

const field = (ctx: Context): Field => {
  const f: Field = {
    id: ctx.expect(null, Syntax.Identifier).value
  };

  ctx.expect([':']);
  const typeString: string = ctx.token.value;
  if (ctx.eat(null, Syntax.Type)) {
    // native type, aka GLOBAL export
    f.global = getType(typeString);
  } else if(ctx.eat(null, Syntax.Identifier)) {
    // now we need to find a typeIndex, if we don't find one we create one
    // with the idea that a type will be filled in later. if one is not we
    // will throw a SyntaxError when we attempt to emit the binary

    f.typeIndex = ctx.Program.Types.findIndex(({ id }) => id === typeString);
    if (f.typeIndex === -1) {
      f.typeIndex = ctx.Program.Types.length;
      ctx.Program.Types.push({
        id: typeString,
        params: [],
        // When we DO define a type for it later, patch the dummy type
        hoist: (node: TypeNode) => {
          ctx.Program.Types[f.typeIndex] = generateType(node)
        }
      });
    }

    // attach to a type index
    f.functionIndex = ctx.Program.Functions.length;
    ctx.Program.Functions.push(null);
    ctx.functions.push(f);
  }

  return f;
}

const fieldList = (ctx: Context): Field[] => {
  const fields: Field[] = [];
  while(ctx.token.value !== '}') {
    const f: Field = field(ctx);
    if (f) {
      fields.push(f);
      ctx.eat([',']);
    }
  }
  ctx.expect(['}']);

  return fields;
}

const _import = (ctx: Context): Import => {
  const node = ctx.startNode();
  ctx.eat(['import']);

  if (!ctx.eat(['{']))
    throw ctx.syntaxError('expected {');

  node.fields = fieldList(ctx);
  ctx.expect(['from']);

  node.module = ctx.expect(null, Syntax.StringLiteral).value;
  // NOTE: string literals contain the starting and ending quote char
  node.module = node.module.substring(1, node.module.length - 1);

  ctx.Program.Imports.push.apply(
    ctx.Program.Imports,
    generateImport(node)
  );

  return ctx.endNode(node, Syntax.Import);
};

export default _import;

