# Default Arguments
@{%
  const Syntax = require('walt-syntax');
  const { flatten } = require('../parser/grammar/helpers');
  const { node } = require('../parser/grammar/nodes')(this.lexer);
%}

TypeList ->
    DefaultArgument {% id %}
  | DefaultArgument _ COMMA _ TypeList {% flatten %}

DefaultArgument -> Type _ EQUALS _ Atom {% node(Syntax.BinaryExpression) %}

ParameterList ->
    DefaultFunctionArgument  {% id %}
  | DefaultFunctionArgument _ COMMA _ ParameterList {% flatten %}

DefaultFunctionArgument ->
    PropertyNameAndType _ EQUALS _ Atom {% node(Syntax.BinaryExpression) %}

