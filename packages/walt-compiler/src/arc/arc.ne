@{%
  const { Syntax } = this;
  const { node, declaration } = this.nodes(this.lexer);

  const ARCDeclare = d => {
    const node = declaration(Syntax.Declaration)(d);
    node.meta.ARC = true;
    node.Type = 'ARCDeclaration';
    return node;
  };
%}

Declaration ->
    LET _ PropertyNameAndType _ EQUALS _ ObjectLiteral _ SEPARATOR {% ARCDeclare %}

ImmutableDeclaration ->
    CONST _ PropertyNameAndType _ EQUALS _ ObjectLiteral _ SEPARATOR {% ARCDeclare %}


