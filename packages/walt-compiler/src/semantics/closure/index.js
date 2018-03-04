// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import mapNode from "../../utils/map-node";
import walkNode from "../../utils/walk-node";
import type { NodeType } from "../../flow/types";

export const CLOSURE_FREE = "closure-free";
export const CLOSURE_MALLOC = "closure-malloc";
export const CLOSURE_BASE = "closure-base";
export const CLOSURE_INNER = "closure-inner";
export const CLOSURE_GET = "closure--get";
export const CLOSURE_SET = "closure--set";

/**
 * "expand" an identifier Node into two nodes, the least significant word which
 * is the table index and into most signifact word Node which is the closure
 * pointer
 *
 */
export const expandClosureIdentifier = (identifier: NodeType): NodeType[] => {
  const bareIdentifier = () => ({ ...identifier, params: [] });
  // regular params, we APPEND function pointer math to list of params
  return [
    {
      ...identifier,
      value: ":",
      meta: {},
      Type: Syntax.Pair,
      params: [
        bareIdentifier(),
        {
          ...identifier,
          value: "i32",
          type: "i32",
          meta: {},
          params: [],
          Type: Syntax.Type,
        },
      ],
    },
    ...identifier.params,
    {
      ...identifier,
      value: ":",
      Type: Syntax.Pair,
      meta: {},
      params: [
        {
          ...identifier,
          value: ">>",
          meta: {},
          Type: Syntax.BinaryExpression,
          params: [
            bareIdentifier(),
            {
              ...identifier,
              value: "32",
              type: "i32",
              meta: {},
              params: [],
              Type: Syntax.Constant,
            },
          ],
        },
        {
          ...identifier,
          meta: {},
          value: "i32",
          type: "i32",
          params: [],
          Type: Syntax.Type,
        },
      ],
    },
  ];
};

export const collapseClosureIdentifier = (
  closure: NodeType,
  pointer: NodeType
): NodeType => {
  return {
    ...closure,
    value: "+",
    Type: Syntax.BinaryExpression,
    params: [
      {
        ...closure,
        value: ":",
        meta: {},
        Type: Syntax.Pair,
        params: [
          { ...closure, Type: Syntax.Identifier, params: [] },
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
            meta: {},
            params: [],
            Type: Syntax.Constant,
          },
        ],
      },
    ],
  };
};

export const mapIdentifierToOffset = (
  base: NodeType,
  offset: number
): NodeType => {
  return {
    ...base,
    value: "+",
    params: [
      {
        ...base,
        value: String(offset),
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

/**
 * Walks over a function ndoe and finds any enclosed variables in any closure in
 * its body. This is used to create an environment object for all of the closures
 */
export const getEnclosedVariables = (fun: NodeType): { [string]: NodeType } => {
  const variables = {};
  const encloseMaybe = curry((locals, identifier, _) => {
    if (locals[identifier.value] == null) {
      variables[identifier.value] = identifier;
    }
  });
  const ignore = curry((locals, identifier, _) => {
    locals[identifier.value] = identifier;
  });
  walkNode({
    // Only map over closures, ignore everything else
    [Syntax.Closure]: (closure, _) => {
      const locals = {};
      const ignoreLocals = ignore(locals);
      // Walk over the closure body enclose upper scope variables if necessary
      walkNode({
        // All arguments and local declarations are ignored. This means that
        // variable name shadowing does not enclose upper scope vars
        [Syntax.FunctionArguments]: (fnArgs, __) => {
          walkNode({
            [Syntax.Pair]: (pair: NodeType) => {
              const [identifier] = pair.params;
              ignoreLocals(identifier, null);
            },
          })(fnArgs);
        },
        [Syntax.Declaration]: ignoreLocals,
        [Syntax.ImmutableDeclaration]: ignoreLocals,
        // Maybe enclose over an upper scope identifier
        [Syntax.Identifier]: encloseMaybe(locals),
      })(closure);
    },
  })(fun);

  return variables;
};

/**
 * Modifies a function parameter list and injects an environment declaration if
 * necessary
 */
export const injectEnvironmentMaybe = (
  {
    mapFunctionCall,
    variables,
  }: {
    mapFunctionCall: NodeType => NodeType,
    variables: { [string]: NodeType },
  },
  params: NodeType[]
): NodeType[] => {
  if (Object.keys(variables).length > 0) {
    const start: NodeType = params[2];
    return [
      ...params.slice(0, 2),
      {
        ...start,
        value: CLOSURE_BASE,
        type: "i32",
        Type: Syntax.Declaration,
        params: [
          mapFunctionCall({
            ...start,
            type: "i32",
            meta: {},
            value: CLOSURE_MALLOC,
            Type: Syntax.FunctionCall,
            params: [
              {
                ...start,
                params: [],
                type: "i32",
                value: "0",
                Type: Syntax.Constant,
              },
            ],
          }),
        ],
      },
      ...params.slice(2),
    ];
  }

  return params;
};

export const transformClosedDeclaration = curry((options, decl, transform) => {
  const { closures, locals } = options;
  const [init] = decl.params;

  // We don't know the size of the environment until all locals are walked. This
  // means we need to patch in the size of the env here where we can map nodes
  if (decl.value === CLOSURE_BASE) {
    return {
      ...locals[decl.value],
      params: [
        {
          ...init,
          params: [
            {
              ...init.params[0],
              value: closures.envSize,
            },
          ],
        },
      ].map(transform),
    };
  }

  // If the value is enclosed and has an initializer we need to transform it into
  // a memory operation. AKA a function call to the closure plugin
  if (init && closures.variables[decl.value] != null) {
    const { offsets } = closures;
    return transform({
      ...init,
      value: `${CLOSURE_SET}-${decl.type}`,
      params: [
        {
          ...mapIdentifierToOffset(
            { ...init, value: CLOSURE_BASE },
            offsets[decl.value]
          ),
        },
        init,
      ],
      meta: {},
      Type: Syntax.FunctionCall,
    });
  }

  // Not a closure of any kind, return the local
  return {
    ...locals[decl.value],
    params: locals[decl.value].params.map(transform),
  };
});

export default curry(function mapClosure(options, node, topLevelTransform) {
  const { locals, closures, fun } = options;
  const { variables, offsets } = closures;

  const patched = mapNode({
    [Syntax.FunctionDeclaration]: decl => {
      // add a name
      return {
        ...decl,
        value: `internalClosure--${fun.value}`,
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
              {
                ...args,
                value: "i32",
                type: "i32",
                params: [],
                Type: Syntax.Type,
              },
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
              { ...rhs, value: String(CLOSURE_INNER) },
              offsets[local.value]
            ),
            lhs,
          ],
          meta: {},
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
