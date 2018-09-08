# Walt Grammar
# Pretty much ECMAScript https://tomcopeland.blogs.com/EcmaScript.html (with types)

@builtin "whitespace.ne"

@{%
  const moo = require('moo');
  const Syntax = require('walt-syntax');
  const { drop, nth, nuller, nonEmpty, add, flatten, compose } = require('./helpers');

  const mooLexer = moo.compile(Syntax.tokens);
  // Additional utility on top of the default moo lexer.
  const lexer = {
    current: null,
    lines: [],
    get line() {
      return mooLexer.line;
    },
    get col() {
      return mooLexer.col;
    },
    save() {
      return mooLexer.save();
    },
    reset(chunk, info){
      this.lines = chunk.split('\n');
      return mooLexer.reset(chunk, info);
    },
    next() {
      // It's a cruel and unusual punishment to implement comments with nearly
      let token = mooLexer.next();
      while(token && token.type === 'comment')
        token = mooLexer.next();
      this.current = token;
      return this.current;
    },
    formatError(token) {
      return mooLexer.formatError(token);
    },
    has(name) {
      return mooLexer.has(name);
    }
  };

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
    declaration,
    call,
    struct,
    result,
    string,
    typedef,
    comment,
    voidFun,
    type,
    boolean,
    assignment,
    forLoop,
    whileLoop,
    typeGeneric,
  } = require('./nodes')(lexer);
%}

@lexer lexer
# @include "./punctuators.ne"
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
    Function  {% id %}
  | Declaration           {% id %}
  | ImmutableDeclaration  {% id %}
  | Struct    {% id %}
  | TypeDef   {% id %}
  | Export    {% id %}
  | Import    {% id %}

Statement ->
    ExpressionStatement   {% id %}
  | Declaration           {% id %}
  | ImmutableDeclaration  {% id %}
  | If                    {% id %}
  | For                   {% id %}
  | While                 {% id %}
  | Break                 {% id %}
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
  | LB _ ParameterList  _ RB {% compose(node(Syntax.FunctionArguments), flatten) %}

ParameterList ->
    PropertyNameAndType {% id %}
  | PropertyNameAndType _ COMMA _ ParameterList {% flatten  %}

FunctionResult -> COLON _ Type {% compose(result, drop) %}

Declaration ->
    LET _ PropertyNameAndType _ EQUALS _ ExpressionStatement {% declaration(Syntax.Declaration) %}
  | LET _ PropertyNameAndType _ SEPARATOR                    {% declaration(Syntax.Declaration) %}

ImmutableDeclaration ->
    CONST _ PropertyNameAndType _ EQUALS _ ExpressionStatement
      {% declaration(Syntax.ImmutableDeclaration) %}
  | CONST _ PropertyNameAndValue _ EQUALS _ ObjectLiteral _ SEPARATOR
      {% declaration(Syntax.ImmutableDeclaration) %}

Pair -> Identifier _ COLON _ Identifier
{% node(Syntax.Pair) %}

Export ->
    EXPORT __ ImmutableDeclaration {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ Function             {% node(Syntax.Export, { value: 'export' }) %}
  | EXPORT __ TypeDef              {% node(Syntax.Export, { value: 'export' }) %}


ReturnStatement ->
    RETURN __ ExpressionStatement {% node(Syntax.ReturnStatement) %}
  | RETURN _ SEPARATOR            {% node(Syntax.ReturnStatement) %}

Struct -> TYPE __ Identifier _ EQUALS _ StructDefinition SEPARATOR {% struct %}
TypeDef -> TYPE __ Identifier _ EQUALS _ TypeDefinition _ FATARROW _ Type _ SEPARATOR {% compose(typedef) %}

# Expressions
ExpressionStatement -> Expression SEPARATOR {% id %}
Expression -> Assignment       {% id %}

# Operators, ordered by precedence asc
Assignment ->
    Access _ EQUALS _ Ternary    {% d => assignment(d, '=') %}
  | Access _ PLSEQUALS _ Ternary {% d => assignment(d, '+=') %}
  | Access _ MINEQUALS _ Ternary {% d => assignment(d, '-=') %}
  | Ternary                      {% id %}


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
    Identifier _ LB ArgumentList RB {% compose(call, flatten) %}
  | Identifier _ LB _ RB            {% call %}
  | Access {% id %}

ArgumentList ->
    Expression                        {% id %}
  | Expression _ COMMA _ ArgumentList {% flatten %}

Access ->
    Identifier DOT Identifier         {% subscript %}
  | Identifier DOT Call               {% subscript %}
  | NativeType DOT Identifier         {% subscript %}
  | NativeType DOT Call               {% subscript %}
  | Identifier LSB _ Expression _ RSB {% subscript %}
  | Grouping                              {% id %}

Grouping ->
    LB Expression RB {% nth(1) %}
  | Atom             {% id %}

Atom ->
    Identifier    {% id %}
  | StringLiteral {% id %}
  | Number        {% id %}

Type ->
    _Type               {% id %}
  | _Type _ LSB _ RSB   {% d => ({ ...d[0], value: d[0].value + "[]", type: d[0].type + "[]" }) %}

_Type ->
    NativeType  {% id %}
  | GenericType {% id %}
  | Identifier  {% type %}

NativeType -> %type {% type %}

GenericType -> Identifier LT _ ObjectLiteral _ GT {% typeGeneric %}

Identifier -> %identifier      {% identifier %}
Number -> %number                {% constant %}
StringLiteral -> %string       {% string %}
Boolean ->
    "true"  {% boolean %}
  | "false" {% boolean %}

word ->
    [a-zA-Z_]                  {% id %}
  | word [a-zA-Z0-9_]          {% add %}
digit ->
    [0-9]                      {% id %}
  | digit [0-9]                {% add %}

# FIXME: empty comment lines throw syntax errors if we attempt to parse them
Comment ->
    %comment            {% comment %}
  | %comment _ Comment  {% comment %}

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
BREAK     -> "break"    {% nuller %}
