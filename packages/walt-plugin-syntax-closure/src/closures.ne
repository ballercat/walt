@{%
  const { Syntax } = this;
  const { drop, extendNode } = this.helpers;
  const { node, typeGeneric } = this.nodes(this.lexer);
  const voidClosure = (d) => {
    const [args, block] = drop(d);
    const resultNode = extendNode(
      { type: null },
      node(Syntax.FunctionResult)([])
    );
    return extendNode(
      {
        params: [
          extendNode(
            {
              params: [args, resultNode, block],
            },
            node(Syntax.FunctionDeclaration)([])
          ),
        ],
      },
      node(Syntax.Closure)([])
    );
  };
  const closure = (d) => {
    const [args, resultNode, block] = drop(d);
    return extendNode(
      {
        params: [
          extendNode(
            {
              params: [args, resultNode, block],
            },
            node(Syntax.FunctionDeclaration)([])
          ),
        ],
      },
      node(Syntax.Closure)([])
    );
  };

  const genericType = (d) => {
    const [id, gen, typeNode] = drop(d);
    return extendNode(
      {
        value: id.value,
        params: [gen, typeNode],
      },
      node(Syntax.GenericType)([])
    );
  };
%}

TypeDef -> TYPE __ Identifier _ EQUALS _ GenericType _ SEPARATOR {% genericType %}

GenericType -> Identifier LT _ Type _ GT {% typeGeneric %}

Closure ->
    FunctionParameters _ FATARROW _ Block                  {% voidClosure %}
  | FunctionParameters _ FunctionResult _ FATARROW _ Block {% closure %}

Expression -> Closure {% id %}
