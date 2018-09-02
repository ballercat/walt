ObjectLiteral -> LCB _ PropertyNameAndValueList:? _ RCB {% node(Syntax.ObjectLiteral) %}
PropertyNameAndValueList -> PropertyNameAndValue (_ COMMA _ PropertyNameAndValue):* {% id %}
PropertyNameAndValue -> PropertyName _ COLON _ Expression {% node(Syntax.Pair) %}
PropertyName -> Identifier {% id %}

