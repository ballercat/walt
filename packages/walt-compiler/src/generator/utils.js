// @flow
import { builtinTypes } from 'walt-syntax';
import opcode from '../emitter/opcode';
import curry from 'curry';
import invariant from 'invariant';
import { I32, I64, F32, F64 } from '../emitter/value_type';
import { LOCAL_INDEX, GLOBAL_INDEX, TYPE_CONST } from '../semantics/metadata';
import type {
  IntermediateVariableType,
  IntermediateOpcodeType,
  RawOpcodeType,
} from './flow/types';
import type { NodeType } from '../flow/types';

export const scopeOperation = curry((op, node) => {
  const local = node.meta[LOCAL_INDEX];
  const _global = node.meta[GLOBAL_INDEX];
  const index = local != null ? local : _global;

  invariant(
    index != null,
    `Unefined index for scope Operation. Possibly missing metadata. op: ${JSON.stringify(
      op
    )} node: ${JSON.stringify(node, null, 2)}`
  );

  const kind = local != null ? op + 'Local' : op + 'Global';
  const params = [Number(index)];

  return {
    kind: opcode[kind],
    params,
    debug: `${node.value}<${node.meta.ALIAS || node.type}>`,
  };
});

export const getConstOpcode = (node: NodeType): IntermediateOpcodeType[] => {
  const nodeType = node.type || builtinTypes.i32;

  const kind: RawOpcodeType = opcode[nodeType + 'Const'];
  const params = [Number(node.value)];

  return [
    {
      kind,
      params,
    },
  ];
};

// clean this up
export const getType = (str: ?string): number => {
  switch (str) {
    case builtinTypes.f32:
      return F32;
    case builtinTypes.f64:
      return F64;
    case builtinTypes.i64:
      return I64;
    case builtinTypes.i32:
    default:
      return I32;
  }
};

export const isBuiltinType = (type: ?string): boolean => {
  return typeof type === 'string' && builtinTypes[type] != null;
};

export const generateValueType = (
  node: NodeType
): IntermediateVariableType => ({
  mutable: node.meta[TYPE_CONST] ? 0 : 1,
  type: getType(node.type),
});
export const setInScope = scopeOperation('Set');
export const getInScope = scopeOperation('Get');
