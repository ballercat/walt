import declaration from './declaration';
import maybeFunctionDeclaration from './maybe-function-declaration';
import _export from './export';
import returnStatement from './return-statement';

const keyword = (ctx) => {
  switch(ctx.token.value) {
    case 'let':
    case 'const':
      return declaration(ctx);
    case 'function':
      return maybeFunctionDeclaration(ctx);
    case 'export':
      return _export(ctx);
    case 'return':
      return returnStatement(ctx);
    default:
      throw ctx.unsupported();
  }
};

export default keyword;

