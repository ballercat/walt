// @flow
import Syntax from '../../Syntax';
import curry from 'curry';
import { extendNode } from '../../utils/extend-node';
import { getTypeSize } from '../../utils/types';
import {
  CLOSURE_TYPE,
  TYPE_ARRAY,
  TYPE_CONST,
  TYPE_INDEX,
  LOCAL_INDEX,
  GLOBAL_INDEX,
} from '../metadata';

const parseArray = type => {
  const subscriptType = type.slice(-2) === '[]' ? 'i32' : null;
  return {
    arrayType: subscriptType ? type.slice(0, -2) : null,
    subscriptType,
  };
};

// Parse and return a fully typed declaration options
// [ type, meta, index ]
const parse = ({ isConst, types, scope, node }) => {
  const { subscriptType, arrayType } = parseArray(node.type);
  const closureType =
    types[node.type] && types[node.type].meta[CLOSURE_TYPE] ? 'i64' : null;

  return [
    subscriptType || closureType || node.type,
    {
      [TYPE_ARRAY]: arrayType,
      [TYPE_CONST]: isConst || null,
      [CLOSURE_TYPE]: closureType,
      [TYPE_INDEX]: Object.keys(types).indexOf(node.type),
    },
    Object.keys(scope).length,
  ];
};

// Parse a local declaration
export const parseDeclaration = curry((isConst, options, node) => {
  const { locals: scope, closures, types } = options;
  const [type, meta, index] = parse({ isConst, types, scope, node });

  scope[node.value] = extendNode(
    {
      params: node.params.map(extendNode({ type: node.type })),
      type,
      meta: { ...meta, [LOCAL_INDEX]: index },
      Type: Syntax.Declaration,
    },
    node
  );

  if (closures.variables[node.value] != null && node.params[0]) {
    closures.offsets[node.value] = closures.envSize;
    closures.envSize += getTypeSize(node.type);
  }
});

// Map a global declaration
export const parseGlobalDeclaration = curry((isConst, options, node) => {
  const { globals: scope, types } = options;
  const [type, meta, index] = parse({ isConst, types, scope, node });

  if (['Table', 'Memory'].includes(node.type)) {
    return extendNode({ meta: { [GLOBAL_INDEX]: -1 } }, node);
  }

  scope[node.value] = extendNode(
    {
      meta: { ...meta, [GLOBAL_INDEX]: index },
      type,
      Type: Syntax.Declaration,
    },
    node
  );

  return scope[node.value];
});
