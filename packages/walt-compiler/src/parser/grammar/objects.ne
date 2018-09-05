# Object Literals

ObjectLiteral ->
    LCB _ RCB
    {% compose(node(Syntax.ObjectLiteral)) %}
  | LCB _ PropertyNameAndValueList _ RCB
    {% compose(node(Syntax.ObjectLiteral), flatten) %}

PropertyNameAndValueList ->
    PropertyNameAndValue                                    {% id %}
  | PropertyNameAndValue _ COMMA _ PropertyNameAndValueList {% flatten %}

PropertyNameAndValue -> PropertyName _ COLON _ Expression {% node(Syntax.Pair) %}

StructDefinition -> LCB _ PropertyNameAndTypeList _ RCB
  {% compose(node(Syntax.ObjectLiteral), flatten) %}

PropertyNameAndTypeList ->
    PropertyNameAndType                                   {% id %}
  | PropertyNameAndType _ COMMA _ PropertyNameAndTypeList {% flatten %}

PropertyNameAndType -> PropertyName _ COLON _ Type {% node(Syntax.Pair) %}

TypeDefinition -> LB _ TypeList _ RB  {% flatten %}
TypeList ->
    Type                    {% id %}
  | Type _ COMMA _ TypeList {% flatten %}

PropertyName -> Identifier {% id %}
