@{%
  const { voidClosure, closure, genericType, typeGeneric } = this.nodes(this.lexer);
%}

TypeDef -> TYPE __ Identifier _ EQUALS _ GenericType _ SEPARATOR {% genericType %}

GenericType -> Identifier LT _ Type _ GT {% typeGeneric %}

Closure ->
    FunctionParameters _ FATARROW _ Block                  {% voidClosure %}
  | FunctionParameters _ FunctionResult _ FATARROW _ Block {% closure %}

Expression -> Closure {% id %}
