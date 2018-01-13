// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import mapNode from "../../utils/map-node";

export default curry(function mapAssignment(options, node, topLevelTransform) {
  const { locals, closures, func } = options;
  const closure = closures.get(node);
  const { variables } = closure;
  let offset = 0;
  const varOffsetMap = Object.keys(variables).reduce(
    (a: { [string]: number }, v: string): any => {
      a[v] = offset;
      offset += 4;
      return a;
    },
    {}
  );

  const mapIdentifierToOffset = (base, local) => {
    return {
      ...base,
      value: "+",
      params: [
        {
          ...base,
          value: varOffsetMap[local.value],
          Type: Syntax.Constant,
          type: "i32",
        },
        {
          ...base,
          value: "__ptr__",
          Type: Syntax.Identifier,
          params: [],
        },
      ],
      Type: Syntax.BinaryExpression,
    };
  };

  const patched = mapNode({
    [Syntax.FunctionDeclaration]: decl => {
      // add a name
      return {
        ...decl,
        value: `internalClosure--${func.value}`,
      };
    },
    [Syntax.FunctionArguments]: (args, _) => {
      return {
        ...args,
        params: [
          {
            ...args,
            value: ":",
            params: [
              {
                ...args,
                value: "__ptr__",
                params: [],
                Type: Syntax.Identifier,
              },
              { ...args, value: "i32", params: [], Type: Syntax.Type },
            ],
            Type: Syntax.Pair,
          },
          ...args.params,
        ],
      };
    },
    // Every assignment becomes a set function call
    [Syntax.Assignment]: assignment => {
      const [rhs, lhs] = assignment.params;
      if (variables[rhs.value] != null) {
        const local = locals[rhs.value];
        return {
          ...assignment,
          value: `${local.type}closureSet__`,
          params: [mapIdentifierToOffset(rhs, local), lhs],
          meta: [],
          Type: Syntax.FunctionCall,
        };
      }
      return assignment;
    },
    // Every lookup becomes a get function call
    [Syntax.Identifier]: (identifier, _) => {
      if (variables[identifier.value] != null) {
        const local = locals[identifier.value];
        return {
          ...identifier,
          value: `${local.type}closureGet__`,
          params: [mapIdentifierToOffset(identifier, local)],
          Type: Syntax.FunctionCall,
        };
      }

      return identifier;
    },
  })(node);

  // Magic
  return topLevelTransform(patched);
});
