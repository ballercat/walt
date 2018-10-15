# Walt Grammar
# Pretty much ECMAScript https://tomcopeland.blogs.com/EcmaScript.html (with types)

@builtin "whitespace.ne"

@{%
  const lexer = this.lexer;
  const Syntax = this.Syntax;
  const { drop, nth, nuller, nonEmpty, add, flatten, compose } = this.helpers;
  const {
    node,
    binary,
    constant,
    identifier,
    statement,
    unary,
    ternary,
    subscript,
    access,
    fun,
    declaration,
    call,
    struct,
    result,
    string,
    char,
    typedef,
    voidFun,
    type,
    assignment,
    forLoop,
    whileLoop,
    typeGeneric,
    spread,
    builtinDecl,
  } = this.nodes(lexer);
%}

@lexer lexer

@include "./objects.ne"
@include "./import.ne"
@include "./control-flow.ne"

Program ->
    _                     {% compose(node('Program', {  value: 'ROOT_NODE' }), flatten) %}
  | _ SourceElementList _ {% compose(node('Program', {  value: 'ROOT_NODE' }), flatten) %}
SourceElementList ->
    SourceElement                      {% flatten %}
  | SourceElement _ SourceElementList  {% compose(drop, flatten, flatten) %}

SourceElement ->
    Function                    {% id %}
  | GlobalDeclaration           {% id %}
  | GlobalImmutableDeclaration  {% id %}
  | StaticDeclaration           {% id %}
  | Struct                      {% id %}
  | TypeDef                     {% id %}
  | Export                      {% id %}
  | Import                      {% id %}

Statement ->
    ExpressionStatement   {% id %}
  | Declaration           {% id %}
  | ImmutableDeclaration  {% id %}
  | Assignment            {% id %}
  | If                    {% id %}
  | For                   {% id %}
  | While                 {% id %}
  | Break                 {% id %}
  | Unreachable           {% id %}
  | ReturnStatement       {% id %}

Block ->
     LCB _ RCB                 {% node(Syntax.Block) %}
  |  LCB _ StatementList _ RCB {% compose(node(Syntax.Block), flatten) %}

StatementList ->
    Statement                 {% drop %}
  | Statement _ StatementList {% flatten %}

Function ->
    FUNCTION __ Identifier _ FunctionParameters _ Block                  {% voidFun %}
  | FUNCTION __ Identifier _ FunctionParameters _ FunctionResult _ Block {% fun %}

FunctionParameters ->
    LB _ RB                  {% node(Syntax.FunctionArguments) %}
  | LB _ ParameterList  _ RB {% compose(node(Syntax.FunctionArguments), flatten, flatten) %}

ParameterList ->
    PropertyNameAndType {% id %}
  | PropertyNameAndType _ COMMA _ ParameterList {% flatten  %}

FunctionResult -> COLON _ Type {% compose(result, drop) %}

GlobalDeclaration ->
    LET _ PropertyNameAndType _ SEPARATOR {% declaration(Syntax.Declaration) %}
  | LET _ PropertyNameAndType _ EQUALS _ Atom _ SEPARATOR
      {% declaration(Syntax.Declaration) %}

GlobalImmutableDeclaration ->
    CONST _ Identifier _ COLON _ GenericType _ SEPARATOR {% builtinDecl %}
  | CONST _ PropertyNameAndType _ EQUALS _ ObjectLiteral _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}
  | CONST _ PropertyNameAndType _ EQUALS _ Atom _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}

Declaration ->
    LET _ PropertyNameAndType _ EQUALS _ ExpressionStatement {% declaration(Syntax.Declaration) %}
  | LET _ PropertyNameAndType _ SEPARATOR                    {% declaration(Syntax.Declaration) %}

ImmutableDeclaration ->
    CONST _ PropertyNameAndType _ EQUALS _ ExpressionStatement
      {% declaration(Syntax.ImmutableDeclaration) %}
  | CONST _ PropertyNameAndType _ EQUALS _ ObjectLiteral _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}
  | CONST _ Identifier _ COLON _ GenericType _ SEPARATOR {% builtinDecl %}

StaticNameAndType ->
    Identifier _ COLON _ ArrayType {% node(Syntax.Pair) %}

StaticDeclaration ->
    CONST _ StaticNameAndType _ EQUALS _ LSB _ RSB _ SEPARATOR {% declaration(Syntax.StaticDeclaration) %}
  | CONST _ StaticNameAndType _ EQUALS _ LSB _ StaticValueList _ RSB _ SEPARATOR {% compose(declaration(Syntax.StaticDeclaration), flatten) %}

StaticValueList ->
    Atom                           {% id %}
  | Atom _ COMMA _ StaticValueList {% flatten %}

Unreachable ->
    THROW _ SEPARATOR              {% node(Syntax.Unreachable) %}
  | THROW _ Expression _ SEPARATOR {% node(Syntax.Unreachable) %}

Pair -> Identifier _ COLON _ Identifier
{% node(Syntax.Pair) %}

Export ->
    EXPORT __ ImmutableDeclaration {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ Function             {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ TypeDef              {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ Struct               {% node(Syntax.Export, { value: 'export' }) %}

ReturnStatement ->
    RETURN __ Expression _ SEPARATOR   {% node(Syntax.ReturnStatement) %}
  | RETURN (";" {% nuller %})          {% node(Syntax.ReturnStatement) %}

Struct -> TYPE __ Identifier _ EQUALS _ StructDefinition SEPARATOR {% struct %}
TypeDef -> TYPE __ Identifier _ EQUALS _ TypeDefinition _ FATARROW _ Type _ SEPARATOR {% compose(typedef) %}

# Assignment is NOT a valid expression in Walt/Wasm. Assignment in WebAssembly
# Does not yield the value assigned, it creates to values on the stack.
Assignment -> AssignmentExpression _ SEPARATOR {% id %}

AssignmentExpression ->
    Access _ EQUALS _ Expression    {% d => assignment(d, '=') %}
  | Access _ PLSEQUALS _ Expression {% d => assignment(d, '+=') %}
  | Access _ MINEQUALS _ Expression {% d => assignment(d, '-=') %}
  | Access _ EQUALS _ ObjectLiteral {% d => assignment(d, '=') %}

# Expression
ExpressionStatement -> Expression SEPARATOR {% id %}
Expression -> Ternary       {% id %}

# Operators, ordered by precedence asc

# Conditionals
Ternary ->
    Ternary _ QUESTION _ TernaryPair {% ternary %}
  | Binary                           {% id %}

TernaryPair -> Expression _ COLON _ Expression {% node(Syntax.Pair) %}

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
    Product _ "*" _ Typecast {% binary %}
  | Product _ "/" _ Typecast {% binary %}
  | Product _ "%" _ Typecast {% binary %}
  | Typecast                 {% id %}

Typecast ->
    Expression _ COLON _ Type {% node(Syntax.Pair) %}
  | Expression _ AS _ Type  {% node(Syntax.Pair) %}
  | Unary                   {% id %}

Unary ->
    "!" Call  {% unary %}
  | "~" Call  {% unary %}
  | "-" Call  {% unary %}
  | "+" Call  {% unary %}
  | "++" Call {% unary %}
  | "--" Call {% unary %}
  | Call      {% id %}

Call ->
    Access _ LB _ ArgumentList _ RB {% compose(call, flatten) %}
  | Access _ LB _ RB            {% call %}
  | Access {% id %}

ArgumentList ->
    Expression                        {% id %}
  # Support for sizeof(i32) etc.,
  | NativeType                        {% id %}
  | Expression _ COMMA _ ArgumentList {% flatten %}

Access ->
    Identifier DOT Identifier         {% access %}
  | NativeType DOT Identifier         {% access %}
  | Access LSB _ Ternary _ RSB        {% subscript %}
  | Grouping                          {% id %}

Grouping ->
    LB _ Expression _ RB {% nth(2) %}
  | Atom                 {% id %}

Atom ->
    Identifier       {% id %}
  | StringLiteral    {% id %}
  | CharacterLiteral {% id %}
  | Number           {% id %}

_Type ->
    NativeType  {% id %}
  | GenericType {% id %}
  | Identifier  {% id %}

ArrayType ->
  _Type _ LSB _ RSB   {% d => ({ ...d[0], value: d[0].value + "[]", type: d[0].type + "[]" }) %}

Type ->
    _Type               {% id %}
  | ArrayType           {% id %}


NativeType -> %type {% type %}
GenericType -> Identifier LT _ StaticObjectLiteral _ GT {% typeGeneric %}

Identifier        -> %identifier  {% identifier %}
Number            -> %number      {% constant %}
StringLiteral     -> %string      {% string %}
CharacterLiteral  -> %char        {% char %}
# Boolean ->
#     "true"  {% boolean %}
#   | "false" {% boolean %}

word ->
    [a-zA-Z_]                  {% id %}
  | word [a-zA-Z0-9_]          {% add %}
digit ->
    [0-9]                      {% id %}
  | digit [0-9]                {% add %}

# FIXME: empty comment lines throw syntax errors if we attempt to parse them
# Comment ->
#     %comment            {% comment %}
#   | %comment _ Comment  {% comment %}

# Punctuators
SEPARATOR -> _ ";"      {% nuller %}
QUESTION  -> "?"        {% nuller %}
COMMA     -> ","        {% nuller %}
DOT       -> "."        {% nuller %}
LB        -> "("        {% nuller %}
RB        -> ")"        {% nuller %}
LSB       -> "["        {% nuller %}
RSB       -> "]"        {% nuller %}
LCB       -> "{"        {% nuller %}
RCB       -> "}"        {% nuller %}
COLON     -> ":"        {% nuller %}
EQUALS    -> "="        {% nuller %}
PLSEQUALS -> "+="       {% nuller %}
MINEQUALS -> "-="       {% nuller %}
GT        -> ">"        {% nuller %}
LT        -> "<"        {% nuller %}
FATARROW  -> "=>"       {% nuller %}
SPREAD    -> "..."      {% nuller %}
FUNCTION  -> "function" {% nuller %}
LET       -> "let"      {% nuller %}
CONST     -> "const"    {% nuller %}
EXPORT    -> "export"   {% nuller %}
IMPORT    -> "import"   {% nuller %}
AS        -> "as"       {% nuller %}
FROM      -> "from"     {% nuller %}
RETURN    -> "return"   {% nuller %}
TYPE      -> "type"     {% nuller %}
IF        -> "if"       {% nuller %}
ELSE      -> "else"     {% nuller %}
FOR       -> "for"      {% nuller %}
WHILE     -> "while"    {% nuller %}
SWITCH    -> "switch"   {% nuller %}
DO        -> "do"       {% nuller %}
THROW     -> "throw"    {% nuller %}
BREAK     -> "break"    {% nuller %}
