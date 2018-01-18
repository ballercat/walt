// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import mapNode from "../../utils/map-node";
import { funcIndex as setMetaFunctionIndex } from "../metadata";
import type { NodeType } from "../../flow/types";

export const CLOSURE_BASE = "closure-base";
export const CLOSURE_INNER = "closure-inner";
export const CLOSURE_GET = "closure--get";
export const CLOSURE_SET = "closure--set";

const CLOSURE_DEFINITIONS = [
  { type: "i32", value: CLOSURE_GET },
  { type: "i32", value: `${CLOSURE_GET}-i32` },
  { type: null, value: `${CLOSURE_SET}-i32` },
];

export const bootstrapClosure = (options: {
  functions: { [string]: NodeType },
  hoist: NodeType[],
}) => {
  const { hoistImports, functions } = options;
  if (functions[CLOSURE_GET] == null) {
    let index = Object.keys(functions).length;
    const template: NodeType = {
      type: "i32",
      value: "",
      params: [],
      range: [],
      meta: [],
      Type: Syntax.FunctionDeclaration,
    };

    CLOSURE_DEFINITIONS.forEach(def => {
      // functions[def.value] = {
      //   ...template,
      //   ...def,
      //   meta: [setMetaFunctionIndex(index++)],
      // };
      // hoistImports.push({
      //   ...template,
      //   params: [
      //     {
      //       ...template,
      //       params: [
      //         {
      //           ...template,
      //           ...def,
      //           params: [],
      //           type: null,
      //           Type: Syntax.Identifier,
      //         },
      //         {
      //           ...template,
      //           ...def,
      //           params: [],
      //           type: null,
      //           Type: Syntax.Type,
      //         },
      //       ],
      //       Type: Syntax.Pair,
      //     },
      //   ],
      //   Type: Syntax.Import,
      // });
    });
  }
};

/**
 * "expand" an identifier Node into two nodes, the least significant word which
 * is the table index and into most signifact word Node which is the closure
 * pointer
 *
 */
export const expandClosureIdentifier = (identifier: NodeType): NodeType[] => {
  // regular params, we APPEND function pointer math to list of params
  return [
    {
      ...identifier,
      value: ":",
      Type: Syntax.Pair,
      meta: [],
      params: [
        {
          ...identifier,
          value: ">>",
          meta: [],
          Type: Syntax.BinaryExpression,
          params: [
            identifier,
            {
              ...identifier,
              value: "32",
              type: "i32",
              meta: [],
              Type: Syntax.Constant,
            },
          ],
        },
        {
          ...identifier,
          meta: [],
          value: "i32",
          type: "i32",
          Type: Syntax.Type,
        },
      ],
    },
    {
      ...identifier,
      value: ":",
      meta: [],
      Type: Syntax.Pair,
      params: [
        identifier,
        {
          ...identifier,
          value: "i32",
          type: "i32",
          meta: [],
          Type: Syntax.Type,
        },
      ],
    },
  ];
};

export const collapseClosureIdentifier = (
  pointer: NodeType,
  closure: NodeType
): NodeType => {
  return {
    ...closure,
    value: "+",
    Type: Syntax.BinaryExpression,
    params: [
      {
        ...closure,
        value: ":",
        meta: [],
        Type: Syntax.Pair,
        params: [
          closure,
          {
            ...closure,
            value: "i64",
            type: "i64",
            Type: Syntax.Type,
            params: [],
          },
        ],
      },
      {
        ...pointer,
        value: "<<",
        Type: Syntax.BinaryExpression,
        params: [
          pointer,
          {
            ...pointer,
            value: "32",
            type: "i64",
            meta: [],
            params: [],
            Type: Syntax.Constant,
          },
        ],
      },
    ],
  };
};

export const mapIdentifierToOffset = (base: NodeType, offset: number) => {
  return {
    ...base,
    value: "+",
    params: [
      {
        ...base,
        value: offset,
        Type: Syntax.Constant,
        type: "i32",
      },
      {
        ...base,
        Type: Syntax.Identifier,
        params: [],
      },
    ],
    Type: Syntax.BinaryExpression,
  };
};

export default curry(function mapClosure(options, node, topLevelTransform) {
  const { locals, closures, func } = options;
  const { variables, offsets } = closures;

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
                value: CLOSURE_INNER,
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
          value: `closure--set-${local.type}`,
          params: [
            mapIdentifierToOffset(
              { ...rhs, value: CLOSURE_INNER },
              offsets[local.value]
            ),
            lhs,
          ],
          meta: [],
          Type: Syntax.FunctionCall,
        };
      }
      return assignment;
    },
    // Every lookup becomes a get function call
    [Syntax.Identifier]: (identifier, _) => {
      if (variables[identifier.value] != null) {
        debugger;
        const local = locals[identifier.value];
        return {
          ...identifier,
          value: `closure--get-${local.type}`,
          params: [
            mapIdentifierToOffset(
              { ...identifier, value: CLOSURE_INNER },
              offsets[local.value]
            ),
          ],
          Type: Syntax.FunctionCall,
        };
      }

      return identifier;
    },
  })(node);

  // Magic
  return topLevelTransform(patched);
});
