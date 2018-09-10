# Object Literals

# Static Object literals are the only valid syntax for things like Genric Type
# definitions. They must _not_ contain any references, function calls etc.
StaticObjectLiteral ->
    LCB _ RCB
    {% compose(node(Syntax.ObjectLiteral)) %}
  | LCB _ StaticPropertyList _ RCB
    {% compose(node(Syntax.ObjectLiteral), flatten) %}

StaticPropertyValue ->
    Number        {% id %}
  | Boolean       {% id %}
  | StringLiteral {% id %}

StaticProperty -> Identifier _ COLON _ StaticPropertyValue {% node(Syntax.Pair) %}

StaticPropertyList ->
    StaticProperty  {% id %}
  | StaticProperty _ COMMA _ StaticPropertyList {% flatten %}

ObjectLiteral ->
    LCB _ RCB
    {% node(Syntax.ObjectLiteral) %}
  | LCB _ PropertyList _ RCB
    {% compose(node(Syntax.ObjectLiteral), flatten) %}

PropertyList ->
    Property                        {% id %}
  | Property _ COMMA _ PropertyList {% flatten %}

Property ->
    Identifier _ COLON _ Ternary {% node(Syntax.Pair) %}
  | SPREAD Identifier {% spread %}
  | Identifier {% id %}

StructDefinition -> LCB _ PropertyNameAndTypeList _ RCB
  {% compose(node(Syntax.ObjectLiteral), flatten) %}

PropertyNameAndTypeList ->
    PropertyNameAndType                                   {% id %}
  | PropertyNameAndType _ COMMA _ PropertyNameAndTypeList {% flatten %}

PropertyNameAndType -> PropertyName _ COLON _ Type {% node(Syntax.Pair) %}

TypeDefinition ->
    LB _ TypeList _ RB  {% flatten %}
  | LB _ RB             {% flatten %}

TypeList ->
    Type                    {% id %}
  | Type _ COMMA _ TypeList {% flatten %}

PropertyName -> Identifier {% id %}
