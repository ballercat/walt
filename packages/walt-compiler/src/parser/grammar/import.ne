
Import -> IMPORT _ ImportDefinition __ FROM __ StringLiteral _ SEPARATOR {% node(Syntax.Import) %}

ImportDefinition -> LCB _ ImportAndTypeList _ RCB
  {% compose(node(Syntax.ObjectLiteral), flatten) %}

ImportAndTypeList ->
    ImportName                                {% id %}
  | ImportAndType                             {% id %}
  | ImportName _ COMMA _ ImportAndTypeList    {% flatten %}
  | ImportAndType _ COMMA _ ImportAndTypeList {% flatten %}

ImportAndType ->
    ImportName _ COLON _ Type       {% node(Syntax.Pair) %}
  | ImportName _ AS _ Identifier    {% node(Syntax.BinaryExpression, { value: 'as' }) %}
  | ImportAndType _ AS _ Identifier {% node(Syntax.BinaryExpression, { value: 'as' }) %}

ImportName -> Identifier {% id %}
