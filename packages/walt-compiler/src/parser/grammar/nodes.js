// Node Types
import { extendNode } from '../../utils/extend-node';
import Syntax from 'walt-syntax';
import { nonEmpty, drop } from './helpers';

const marker = lexer => {
  const { col, line } = lexer;

  if (!lexer.lines.length) {
    return { col, line, sourceLine: '' };
  }

  return {
    col,
    line,
    sourceLine: lexer.lines[lexer.line - 1],
  };
};

export default function factory(lexer) {
  const node = (Type, seed = {}) => d => {
    const params = d.filter(nonEmpty);
    const { value = '', meta = {} } = seed;
    const start = marker(lexer);
    const end =
      params[params.length - 1] && params[params.length - 1].range
        ? params[params.length - 1].range[1]
        : { ...start, col: start.col + value.length };

    return {
      value,
      type: null,
      Type,
      toString() {},
      meta,
      range: [start, end],
      params,
    };
  };

  const binary = d => {
    const [lhs, operator, rhs] = d.filter(nonEmpty);
    let Type = Syntax.BinaryExpression;
    if (operator.value === '||' || operator.value === '&&') {
      Type = Syntax.Select;
    }
    return node(Type, { value: operator.value })([lhs, rhs]);
  };

  const constant = d => {
    const value = d[0].value;
    return extendNode(
      {
        value: `${value}`,
        type: value.toString().indexOf('.') !== -1 ? 'f32' : 'i32',
      },
      node(Syntax.Constant)([])
    );
  };

  const identifier = d => node('Identifier', { value: d.join('') })([]);

  const declaration = Type => d => {
    const [pair, ...init] = drop(d);
    const [id, type] = pair.params;
    return extendNode(
      {
        value: id.value,
        type: type.value,
      },
      node(Type)(init)
    );
  };

  const unary = ([operator, target]) => {
    let params = [target];

    if (operator.value === '-') {
      params = [
        {
          ...target,
          value: '0',
          Type: Syntax.Constant,
          params: [],
          meta: {},
        },
        target,
      ];
    }

    return extendNode(
      {
        value: operator.value,
        params,
      },
      node(Syntax.UnaryExpression)([operator, target])
    );
  };

  const ternary = d => {
    return extendNode(
      {
        value: '?',
      },
      node(Syntax.TernaryExpression)(d)
    );
  };

  const subscript = d => {
    const [id, field] = d.filter(nonEmpty);
    return extendNode(
      {
        value: id.value,
        params: [id, field],
      },
      node(Syntax.ArraySubscript)([id, field])
    );
  };

  const fun = d => {
    const [name, args, result, block] = d.filter(nonEmpty);
    return {
      ...name,
      Type: Syntax.FunctionDeclaration,
      meta: [],
      params: [args, result, block],
    };
  };

  const voidFun = d => {
    const params = drop(d);
    const [name, args, block] = params;
    const result = extendNode({ type: null }, node(Syntax.FunctionResult)([]));
    return extendNode(
      {
        value: name.value,
        params: [args, result, block],
      },
      node(Syntax.FunctionDeclaration)(params)
    );
  };

  const result = d => {
    const [type] = drop(d);

    return extendNode(
      {
        type: type != null && type.value !== 'void' ? type.value : null,
      },
      node(Syntax.FunctionResult)(d)
    );
  };

  const call = d => {
    let [id, ...params] = drop(d);

    return extendNode(
      {
        value: id.value,
      },
      node(Syntax.FunctionCall)([id, ...params])
    );
  };

  const struct = d => {
    const [id, ...params] = drop(d);
    return extendNode(
      {
        value: id.value,
      },
      node(Syntax.Struct)(params)
    );
  };

  const typedef = d => {
    const [id, args, res] = drop(d);

    return extendNode(
      {
        value: id.value,
        params: [
          node(Syntax.FunctionArguments)(args),
          extendNode(
            {
              type: res.value,
            },
            node(Syntax.FunctionResult)([res])
          ),
        ],
        type: res.type,
      },
      node(Syntax.Typedef)([id, args, result])
    );
  };

  const string = d => {
    return extendNode(
      {
        value: d[0].value,
        type: 'i32',
      },
      node(Syntax.StringLiteral)([])
    );
  };

  return {
    node,
    binary,
    constant,
    identifier,
    unary,
    ternary,
    subscript,
    access(d) {
      const n = subscript(d);
      n.Type = 'Access';
      return n;
    },
    fun,
    declaration,
    call,
    struct,
    result,
    string,
    char(d) {
      return extendNode(
        {
          value: d[0].value,
          type: 'i32',
        },
        node(Syntax.CharacterLiteral)([])
      );
    },
    type(d) {
      return extendNode(
        {
          value: d[0].value,
          type: d[0].value,
          params: [],
        },
        node(Syntax.Type)(d)
      );
    },
    typeGeneric(d) {
      const [id, obj] = drop(d);
      return extendNode(
        {
          value: id.value,
          type: id.value,
          params: [obj],
        },
        node(Syntax.Type)(d)
      );
    },
    typedef,
    voidFun,
    assignment(d, value) {
      let Type = Syntax.Assignment;
      if (
        d[0] &&
        (d[0].Type === Syntax.ArraySubscript || d[0].Type === 'Access')
      ) {
        Type = Syntax.MemoryAssignment;
      }

      if (['-=', '+='].includes(value)) {
        const operator = value[0];
        const [target, amount] = drop(d);
        const b = binary([target, { value: operator }, amount]);
        return node(Type, {
          value: '=',
        })([target, b]);
      }

      return node(Type, { value })(d);
    },
    forLoop(d) {
      const [initializer, condition, afterthought, ...body] = drop(d);
      return node(Syntax.Loop)([initializer, condition, ...body, afterthought]);
    },
    whileLoop(d) {
      const noop = node(Syntax.Noop)([]);
      return node(Syntax.Loop)([noop, ...d]);
    },
    spread(d) {
      return node(Syntax.Spread)(d);
    },
    builtinDecl(d) {
      const [id, typeNode] = drop(d);

      return extendNode(
        {
          value: id.value,
          type: typeNode.value,
          params: [typeNode],
        },
        node(Syntax.ImmutableDeclaration)(d)
      );
    },
  };
}
