import declaration from './declaration';
import maybeFunctionDeclaration from './maybe-function-declaration';
import _export from './export';
import _import from './import';
import type from './type';
import returnStatement from './return-statement';
import ifThenElse from './if-then-else';

const keyword = (ctx) => {
  switch(ctx.token.value) {
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
    case 'return':
      return returnStatement(ctx);
    default:
      throw ctx.unsupported();
  }
};

export default keyword;

