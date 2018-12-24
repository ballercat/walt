# Walt Grammar
# Pretty much ECMAScript https://tomcopeland.blogs.com/EcmaScript.html (with types)

@builtin "whitespace.ne"

@{%
  const lexer = this.lexer;
  const Syntax = this.Syntax;
  const {
    extendNode,
    drop,
    nth,
    nuller,
    nonEmpty,
    add,
    flatten,
    compose
  } = this.helpers;
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
    arrayType,
    assignment,
    forLoop,
    whileLoop,
    typeGeneric,
    spread,
    builtinDecl,
    assignmentExpr,
    addressOf,
  } = this.nodes(lexer);
%}

@lexer lexer

@include "./types.ne"
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
    NameAndType                         {% id %}
  | NameAndType _ COMMA _ ParameterList {% flatten  %}

NameAndType -> Identifier _ COLON _ DeclType {% node(Syntax.Pair) %}
DeclType -> Type {% compose(extendNode({ Type: Syntax.DeclType }), nth(0)) %}

FunctionResult -> COLON _ Type {% compose(result, drop) %}

GlobalDeclaration ->
    LET _ NameAndType _ SEPARATOR {% declaration(Syntax.Declaration) %}
  | LET _ NameAndType _ EQUALS _ Atom _ SEPARATOR
      {% declaration(Syntax.Declaration) %}

GlobalImmutableDeclaration ->
    CONST _ Identifier _ COLON _ GenericType _ SEPARATOR {% builtinDecl %}
  | CONST _ NameAndType _ EQUALS _ ObjectLiteral _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}
  | CONST _ NameAndType _ EQUALS _ Atom _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}

Declaration ->
    LET _ NameAndType _ EQUALS _ Expression _ SEPARATOR {% declaration(Syntax.Declaration) %}
  | LET _ NameAndType _ SEPARATOR                    {% declaration(Syntax.Declaration) %}

ImmutableDeclaration ->
    CONST _ NameAndType _ EQUALS _ Expression _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}
  | CONST _ NameAndType _ EQUALS _ ObjectLiteral _ SEPARATOR
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
    EXPORT __ ImmutableDeclaration  {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ Function              {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ TypeDef               {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ Struct                {% node(Syntax.Export, { value: 'export' }) %}

ReturnStatement ->
    RETURN __ Expression _ SEPARATOR
                                    {% node(Syntax.ReturnStatement) %}
  | RETURN (";" {% nuller %})       {% node(Syntax.ReturnStatement) %}


# Assignment is NOT a valid expression in Walt/Wasm. Assignment in WebAssembly
# Does not yield the value assigned, it creates two values on the stack.
Assignment -> _Assignment _ SEPARATOR
                                    {% id %}

_Assignment ->
    Subscript _ EQUALS _ Expression
                                    {% d => assignment(d, '=') %}
  | Subscript _ PLSEQUALS _ Expression
                                    {% d => assignment(d, '+=') %}
  | Subscript _ MINEQUALS _ Expression
                                    {% d => assignment(d, '-=') %}
  | Subscript _ EQUALS _ ObjectLiteral
                                    {% d => assignment(d, '=') %}

# Expression
ExpressionStatement -> Call _ SEPARATOR {% id %}
Expression -> AssignmentExpression              {% id %}

# Operators, ordered by precedence asc
AssignmentExpression ->
    Identifier _ EQUALS _ Ternary
                                    {% d => assignmentExpr(d, '=') %}
  | Identifier _ PLSEQUALS _ Ternary
                                    {% d => assignmentExpr(d, '+=') %}
  | Identifier _ MINEQUALS _ Ternary
                                    {% d => assignmentExpr(d, '-=') %}
  | Ternary                         {% id %}

# Conditionals
Ternary ->
    Ternary _ QUESTION _ TernaryPair
                                    {% ternary %}
  | Binary                          {% id %}

TernaryPair -> Expression _ COLON _ Expression
                                    {% node(Syntax.Pair) %}

Binary -> Logical                   {% id %}

Logical ->
    Logical _ "||" _ Bitwise        {% binary %}
  | Logical _ "&&" _ Bitwise        {% binary %}
  | Bitwise                         {% id %}

Bitwise ->
    Bitwise _ "|" _ Sum             {% binary %}
  | Bitwise _ "^" _ Sum             {% binary %}
  | Bitwise _ "&" _ Sum             {% binary %}
  | Equality                        {% id %}

Equality ->
    Equality _ "==" _ Comparison    {% binary %}
  | Equality _ "!=" _ Comparison    {% binary %}
  | Comparison                      {% id %}

Comparison ->
    Comparison _ "<" _ Shift        {% binary %}
  | Comparison _ ">" _ Shift        {% binary %}
  | Comparison _ "<=" _ Shift       {% binary %}
  | Comparison _ ">=" _ Shift       {% binary %}
  | Shift {% id %}


Shift ->
    Shift _ ">>" _ Sum              {% binary %}
  | Shift _ "<<" _ Sum              {% binary %}
  | Shift _ ">>>" _ Sum             {% binary %}
  | Sum {% id %}

Sum ->
    Sum _ "+" _ Product             {% binary %}
  | Sum _ "-" _ Product             {% binary %}
  | Product                         {% id %}

Product ->
    Product _ "*" _ Typecast        {% binary %}
  | Product _ "/" _ Typecast        {% binary %}
  | Product _ "%" _ Typecast        {% binary %}
  | Typecast                        {% id %}

Typecast ->
    Expression _ COLON _ DeclType   {% node(Syntax.Pair) %}
  | Expression _ AS _ DeclType      {% node(Syntax.Pair) %}
  | Unary                           {% id %}

Unary ->
    "!" Call                        {% unary %}
  | "~" Call                        {% unary %}
  | "-" Call                        {% unary %}
  | "+" Call                        {% unary %}
  | "++" Call                       {% unary %}
  | "--" Call                       {% unary %}
  | Call                            {% id %}

Call ->
    Subscript _ LB _ ArgumentList _ RB
                                    {% compose(call, flatten) %}
  | Subscript _ LB _ RB             {% call %}
  | Subscript {% id %}

ArgumentList ->
    Expression                      {% id %}
  | NativeType                      {% id %}
  | Expression _ COMMA _ ArgumentList
                                    {% flatten %}

Subscript ->
    Access LSB _ Expression _ RSB Subscript
                                    {% subscript %}
  | Access LSB _ Expression _ RSB   {% subscript %}
  | Access                          {% id %}

Access ->
    Access DOT Identifier           {% compose(access, drop) %}
  | NativeType DOT Access           {% compose(access, drop) %}
  | Grouping                        {% id %}

Grouping ->
    LB _ Expression _ RB            {% nth(2) %}
  | Atom                            {% id %}

Atom ->
    Identifier                      {% id %}
  | StringLiteral                   {% id %}
  | CharacterLiteral                {% id %}
  | Number                          {% id %}

NativeType        -> %type          {% type %}
Identifier        -> %identifier    {% identifier %}
Number            -> %number        {% constant %}
StringLiteral     -> %string        {% string %}
CharacterLiteral  -> %char          {% char %}
# Boolean ->
#     "true"  {% boolean %}
#   | "false" {% boolean %}

word ->
    [a-zA-Z_]                       {% id %}
  | word [a-zA-Z0-9_]               {% add %}
digit ->
    [0-9]                           {% id %}
  | digit [0-9]                     {% add %}

# FIXME: empty comment lines throw syntax errors if we attempt to parse them
# Comment ->
#     %comment            {% comment %}
#   | %comment _ Comment  {% comment %}

# Punctuators
SEPARATOR -> _ ";"                  {% nuller %}
QUESTION  -> "?"                    {% nuller %}
COMMA     -> ","                    {% nuller %}
AND       -> "&"                    {% nuller %}
DOT       -> "."                    {% nuller %}
LB        -> "("                    {% nuller %}
RB        -> ")"                    {% nuller %}
LSB       -> "["                    {% nuller %}
RSB       -> "]"                    {% nuller %}
LCB       -> "{"                    {% nuller %}
RCB       -> "}"                    {% nuller %}
OR        -> "|"                    {% nuller %}
COLON     -> ":"                    {% nuller %}
EQUALS    -> "="                    {% nuller %}
PLSEQUALS -> "+="                   {% nuller %}
MINEQUALS -> "-="                   {% nuller %}
GT        -> ">"                    {% nuller %}
LT        -> "<"                    {% nuller %}
FATARROW  -> "=>"                   {% nuller %}
SPREAD    -> "..."                  {% nuller %}
FUNCTION  -> "function"             {% nuller %}
LET       -> "let"                  {% nuller %}
CONST     -> "const"                {% nuller %}
EXPORT    -> "export"               {% nuller %}
IMPORT    -> "import"               {% nuller %}
AS        -> "as"                   {% nuller %}
FROM      -> "from"                 {% nuller %}
RETURN    -> "return"               {% nuller %}
TYPE      -> "type"                 {% nuller %}
IF        -> "if"                   {% nuller %}
ELSE      -> "else"                 {% nuller %}
FOR       -> "for"                  {% nuller %}
WHILE     -> "while"                {% nuller %}
SWITCH    -> "switch"               {% nuller %}
DO        -> "do"                   {% nuller %}
THROW     -> "throw"                {% nuller %}
BREAK     -> "break"                {% nuller %}
