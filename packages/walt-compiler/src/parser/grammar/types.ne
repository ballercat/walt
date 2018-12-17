# Type Definition Grammar

# Struct types are object like definitions
Struct -> TYPE __ Identifier _ EQUALS _ Union SEPARATOR {% struct %}

Union ->
    StructDefinition              {% id %}
  | StructDefinition _ OR _ Union {% node('UnionType') %}

StructDefinition ->
    Type
    {% id %}
  | LCB _ StructBody _ RCB
    {% compose(node(Syntax.ObjectLiteral), flatten) %}

StructBody ->
    NameAndType                      {% id %}
  | NameAndType _ COMMA _ StructBody {% flatten %}

NameAndType -> Identifier _ COLON _ Type {% node(Syntax.Pair) %}

# Type definitions are used for function types
# type Foo = (i32, i32) => f32;
TypeDef -> TYPE __ Identifier _ EQUALS _ TypeDefinition _ FATARROW _ Type _ SEPARATOR {% compose(typedef) %}

TypeDefinition ->
    LB _ TypeList _ RB  {% flatten %}
  | LB _ RB             {% flatten %}

TypeList ->
    Type                    {% id %}
  | Type _ COMMA _ TypeList {% flatten %}

