
TypeDef -> TYPE __ Identifier _ EQUALS _ GenericType _ SEPARATOR {% genericType %}

GenericType -> Identifier LT _ Type _ GT {% typeGeneric %}

Closure ->
    FunctionParameters _ FATARROW _ Block                  {% voidClosure %}
  | FunctionParameters _ FunctionResult _ FATARROW _ Block {% closure %}

Expression -> Closure {% id %}

# Function ->
#     FUNCTION __ Identifier _ FunctionParameters _ Block                  {% voidFun %}
#   | FUNCTION __ Identifier _ FunctionParameters _ FunctionResult _ Block {% fun %}
#
# FunctionParameters ->
#     LB _ RB                  {% node(Syntax.FunctionArguments) %}
#   | LB _ ParameterList  _ RB {% compose(node(Syntax.FunctionArguments), flatten) %}
#
# ParameterList ->
#     PropertyNameAndType {% id %}
#   | PropertyNameAndType _ COMMA _ ParameterList {% flatten  %}
#
# FunctionResult -> COLON _ Type {% compose(result, drop) %}
