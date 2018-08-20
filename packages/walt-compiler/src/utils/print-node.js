/* istanbul ignore file */
// @flow
import walkNode from 'walt-parser-tools/walk-node';
import Syntax from 'walt-syntax';
import { GLOBAL_INDEX, TYPE_CONST } from '../semantics/metadata';
import { opcodeFromOperator, getTypecastOpcode } from '../emitter/opcode';
import { parseBounds } from './resizable-limits';
import type { NodeType, TypeCastType } from '../flow/types';

const getText = (node: NodeType): string => {
  const value = node.value || '??';
  const hasType = node.type;
  const type = hasType || 'i32';
  const op = opcodeFromOperator({ value, type });

  if (!hasType) {
    return op.text.replace('i32', '??');
  }

  return op.text;
};

const parseParams = (node: NodeType): string => {
  const params = [];
  walkNode({
    [Syntax.Pair]: (pair, _) => {
      params.push(`${pair.params[0].value} ${pair.params[1].value}`);
    },
    [Syntax.Type]: p => {
      params.push(p.value);
    },
  })(node);
  return params.length ? ' param(' + params.join(' ') + ')' : '';
};

const parseResult = (node: ?NodeType): string => {
  if (node == null) {
    return '';
  }
  return ' (result ' + (node.type || '??') + ')';
};

const typedefString = (node: NodeType): string => {
  const [paramsNode, resultNode] = node.params;
  return (
    '(type ' +
    node.value +
    ` (func${parseParams(paramsNode)}${parseResult(resultNode)}))`
  );
};

const getPrinters = add => ({
  [Syntax.Import]: (node, _print) => {
    const [nodes, mod] = node.params;
    walkNode({
      [Syntax.Pair]: ({ params }, _) => {
        const { value: field } = params[0];
        const type = params[1];

        if (type.value === 'Memory') {
          const memory = parseBounds(type);
          add(
            `(import "${mod.value}" "${field}" (memory ${memory.initial}${
              memory.max ? memory.max : ''
            }))`
          );
        } else {
          add(`(import "${mod.value}" "${field}" ${typedefString(type)})`);
        }
      },
      [Syntax.Identifier]: (missing, _) => {
        const { value } = missing;
        add(`(import "${mod.value}" "${value}" (type ??))`);
      },
    })(nodes);
  },
  [Syntax.Export]: (node, print) => {
    add('(export', 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.GenericType]: (node, _print) => {
    add('(type-generic ' + node.value + ')', 0, 0, ' pseudo type');
  },
  [Syntax.FunctionCall]: (node, print) => {
    if (node.params.length > 0) {
      add(`(call ${node.value}`, 2);
      node.params.forEach(print);
      add(')', 0, -2);
    } else {
      add(`(call ${node.value})`);
    }
  },
  [Syntax.BinaryExpression]: (node: NodeType, print) => {
    const text = getText(node);
    add('(' + text, 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ArraySubscript]: (node: NodeType, print) => {
    add('(i32.add', 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.Typedef]: (node, _) => {
    add(typedefString(node));
  },
  [Syntax.Identifier]: node => {
    const scope = node.meta[GLOBAL_INDEX] != null ? 'global' : 'local';
    add(`(get_${scope} ${node.value})`);
  },
  [Syntax.Constant]: node => {
    add(`(${String(node.type)}.const ${node.value})`);
  },
  [Syntax.FunctionPointer]: node => {
    add(`(${String(node.type)}.table_pointer ${node.value})`);
  },
  [Syntax.FunctionDeclaration]: (node, print) => {
    const [params, result, ...rest] = node.params;
    add(`(func ${node.value}${parseParams(params)}${parseResult(result)}`, 2);

    rest.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ReturnStatement]: (node, print) => {
    add('(return', 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.Declaration]: (node, print) => {
    const mutability = node.meta[TYPE_CONST] != null ? 'immutable' : 'mutable';
    add(
      '(local ' + node.value + ' ' + String(node.type),
      2,
      0,
      ` ${mutability}`
    );
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ImmutableDeclaration]: (node, print) => {
    const scope = node.meta[GLOBAL_INDEX] != null ? 'global' : 'local';
    if (node.type === 'Memory') {
      const memory = parseBounds(node);
      add(`(memory ${memory.initial}${memory.max ? ` ${memory.max}` : ''})`);
    } else {
      add(
        `(${scope} ` + node.value + ' ' + String(node.type),
        2,
        0,
        ' immutable'
      );
      node.params.forEach(print);
      add(')', 0, -2);
    }
  },
  [Syntax.StringLiteral]: node => {
    add('(i32.const ??)', 0, 0, ` string "${node.value}"`);
  },
  [Syntax.Type]: node => {
    add(node.value);
  },
  [Syntax.TypeCast]: (node: TypeCastType, print) => {
    const from = node.params[0];
    const op = getTypecastOpcode(String(node.type), from.type);
    add('(' + op.text, 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ArraySubscript]: (node, print) => {
    add('(' + String(node.type) + '.load', 2, 0);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.MemoryAssignment]: (node, print) => {
    add('(' + String(node.type) + '.store', 2, 0);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.Assignment]: (node, print) => {
    const [target, ...params] = node.params;
    const scope = target.meta[GLOBAL_INDEX] != null ? 'global' : 'local';
    add(`(set_${scope} ${target.value}`, 2);
    params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.TernaryExpression]: (node, print) => {
    const [condition, options] = node.params;
    add('(select', 2);
    print(options);
    print(condition);
    add(')', 0, -2);
  },
  [Syntax.IfThenElse]: (node, print) => {
    const [condition, then, ...rest] = node.params;
    add('(if', 2);
    print(condition);
    add('(then', 2);
    print(then);
    add(')', 0, -2);
    if (rest.length > 0) {
      add('(else', 2);
      rest.forEach(print);
      add(')', 0, -2);
    }
    add(')', 0, -2);
  },
  [Syntax.ObjectLiteral]: (_, __) => {},
});

const printNode = (node?: NodeType): string => {
  if (node == null) {
    return '';
  }

  let depth = 0;
  const offsets = [];
  const pieces = [];
  const comments = [];
  const add = (piece, post = 0, pre = 0, comment = '') => {
    depth += pre;
    comments.push(comment);
    pieces.push(piece);
    offsets.push(depth + piece.length);
    depth += post;
  };

  walkNode(getPrinters(add))(node);

  const max = Math.max(...offsets);
  const edge = max + 4;
  const result = pieces.reduce((acc, val, i) => {
    acc +=
      val.padStart(offsets[i], ' ').padEnd(edge, ' ') +
      ';' +
      comments[i] +
      '\n';
    return acc;
  }, '');

  return result;
};

export default printNode;
