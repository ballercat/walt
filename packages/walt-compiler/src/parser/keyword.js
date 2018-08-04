// @flow
import declaration from './declaration';
import maybeFunctionDeclaration from './maybe-function-declaration';
import _export from './export';
import _import from './import';
import _break from './break';
import type from './type';
import forLoop from './for-loop';
import whileLoop from './while-loop';
import returnStatement from './return-statement';
import ifThenElse from './if-then-else';
import Context from './context';

const keyword = (ctx: Context) => {
  switch (ctx.token.value) {
    case 'let':
    case 'const':
      return declaration(ctx);
    case 'function':
      return maybeFunctionDeclaration(ctx);
    case 'export':
      return _export(ctx);
    case 'import':
      return _import(ctx);
    case 'type':
      return type(ctx);
    case 'if':
      return ifThenElse(ctx);
    case 'for':
      return forLoop(ctx);
    case 'while':
      return whileLoop(ctx);
    case 'return':
      return returnStatement(ctx);
    case 'break':
      return _break(ctx);
    default:
      throw ctx.unsupported();
  }
};

export default keyword;
