# Object Literals

ObjectLiteral -> LCB _ PropertyNameAndValueList:? _ RCB {% d => node(Syntax.ObjectLiteral)(d[2]) %}
PropertyNameAndValueList -> PropertyNameAndValue (_ COMMA _ PropertyNameAndValue {% nth(3) %}):* {% d => [d[0]].concat(d[1]) %}
PropertyNameAndValue -> PropertyName _ COLON _ Expression {% node(Syntax.Pair) %}
PropertyName -> Identifier {% id %}

