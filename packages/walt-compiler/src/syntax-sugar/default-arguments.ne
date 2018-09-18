# Default Arguments
@{%
  const Syntax = this.Syntax;
  const { flatten } = this.helpers;
  const { node } = this.nodes(this.lexer);
%}

TypeList ->
    DefaultArgument {% id %}
  | DefaultArgument _ COMMA _ TypeList {% flatten %}

DefaultArgument -> Type _ EQUALS _ Atom {% node(Syntax.Assignment) %}

ParameterList ->
    DefaultFunctionArgument  {% id %}
  | DefaultFunctionArgument _ COMMA _ ParameterList {% flatten %}

DefaultFunctionArgument ->
    PropertyNameAndType _ EQUALS _ Atom {% node(Syntax.Assignment) %}

