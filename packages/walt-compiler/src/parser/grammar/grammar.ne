# Walt Grammar
# Pretty much ECMAScript https://tomcopeland.blogs.com/EcmaScript.html (with types)

@builtin "whitespace.ne"

@{%
const moo = require('moo');
const Syntax = require('walt-syntax');
const { nth, nuller, nonEmpty, add } = require('./helpers');
console.log(Syntax.tokens);
const lexer = moo.compile(Syntax.tokens);
const {
  node,
  binary,
  constant,
  identifier,
  statement,
  unary,
  ternary,
  subscript,
  fun,
} = require('./nodes')(lexer);

%}

@lexer lexer

Program -> _SourceElement:* _ {% d => node('Program', {  value: 'ROOT_NODE' })(d[0]) %}
_SourceElement -> _ SourceElement {% nth(1) %}
SourceElement ->
    Function  {% id %}
  | Statement {% id %}

Statement ->
    ExpressionStatement   {% id %}
  | Declaration           {% id %}
  | ImmutableDeclaration  {% id %}

_Statement -> _ Statement {% nth(1) %}

# The way blocks/statements are written is pretty frustrating tbh
Block -> _Block {% d => node(Syntax.Block)(d[0]) %}
_Block -> LCB _Statement:* _ RCB {% nth(1) %}

Function ->
  FUNCTION __ Identifier _ FunctionParameters _ FunctionResult _ Block
{% fun %}

FunctionParameters -> LB _ ParameterList:?  _ RB
{% node(Syntax.FunctionArguments) %}

ParameterList -> Pair (_ "," _ Pair):?
{% id %}

FunctionResult -> (COLON _ Identifier {% nth(2) %}):?
{% node(Syntax.FunctionResult) %}

Declaration -> LET _ Pair _ ("=" {% nuller %}) _ ExpressionStatement
{% node(Syntax.Declaration) %}

ImmutableDeclaration -> CONST _ Pair _ ("=" {% nuller %}) _ ExpressionStatement
{% node(Syntax.ImmutableDeclaration) %}

Pair -> Identifier _ COLON _ Identifier
{% node(Syntax.Pair) %}

# Expressions
ExpressionStatement -> Expression SEPARATOR {% id %}
Expression -> Assignment                    {% id %}

# Operators, ordered by precedence asc
Assignment ->
    Identifier _ EQUALS _ Ternary {% node(Syntax.Assignment) %}
  | Ternary                    {% id %}

Assignment ->
  Identifier LSb Expression RSB _ EQUALS _ Ternary
  {% node(Syntax.MemoryAssignment) %}

# Conditionals
Ternary ->
    Ternary _ "?" _ Ternary _ ":" _ Ternary {% ternary %}
  | Binary                                  {% id %}

Binary -> Logical        {% id %}

Logical ->
    Logical _ "||" _ Bitwise {% binary %}
  | Logical _ "&&" _ Bitwise {% binary %}
  | Bitwise                  {% id %}

Bitwise ->
    Bitwise _ "|" _ Sum {% binary %}
  | Bitwise _ "^" _ Sum {% binary %}
  | Bitwise _ "&" _ Sum {% binary %}
  | Equality            {% id %}

Equality ->
    Equality _ "==" _ Comparison {% binary %}
  | Equality _ "!=" _ Comparison {% binary %}
  | Comparison                   {% id %}

Comparison ->
    Comparison _ "<" _ Shift  {% binary %}
  | Comparison _ ">" _ Shift  {% binary %}
  | Comparison _ "<=" _ Shift {% binary %}
  | Comparison _ ">=" _ Shift {% binary %}
  | Shift {% id %}


Shift ->
    Shift _ ">>" _ Sum  {% binary %}
  | Shift _ "<<" _ Sum  {% binary %}
  | Shift _ ">>>" _ Sum {% binary %}
  | Sum {% id %}

Sum ->
    Sum _ "+" _ Product           {% binary %}
  | Sum _ "-" _ Product           {% binary %}
  | Product                       {% id %}

Product ->
    Product _ "*" _ Unary {% binary %}
  | Product _ "/" _ Unary {% binary %}
  | Product _ "%" _ Unary {% binary %}
  | Unary                 {% id %}

Unary ->
    "!" Access  {% unary %}
  | "~" Access  {% unary %}
  | "-" Access  {% unary %}
  | "+" Access  {% unary %}
  | "++" Access {% unary %}
  | "--" Access {% unary %}
  | Access      {% id %}

Access ->
    Identifier DOT Identifier         {% subscript %}
  | Identifier LSB _ Expression _ RSB {% subscript %}
  | Atom                              {% id %}

Atom ->
    Identifier {% id %}
  | Number     {% id %}

Identifier -> word             {% identifier %}
Number -> digit                {% constant %}

word ->
    [a-zA-Z_]                  {% id %}
  | word [a-zA-Z0-9_]          {% add %}
digit ->
    [0-9]                      {% id %}
  | digit [0-9]                {% add %}


# Punctuators
SEPARATOR -> _ ";"      {% nuller %}
FUNCTION  -> "function" {% nuller %}
DOT       -> "."        {% nuller %}
LB        -> "("        {% nuller %}
RB        -> ")"        {% nuller %}
LSB       -> "["        {% nuller %}
RSB       -> "]"        {% nuller %}
LCB       -> "{"        {% nuller %}
RCB       -> "}"        {% nuller %}
COLON     -> ":"        {% nuller %}
EQUALS    -> "="        {% nuller %}
LET       -> "let"      {% nuller %}
CONST     -> "const"    {% nuller %}
