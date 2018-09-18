// @flow
import { i32, i64, f32, f64 } from 'wasm-types';
import type { RawOpcodeType } from '../generator/flow/types';

/**
 * Ported from https://github.com/WebAssembly/wabt/blob/master/src/opcode.def
 */
const def: { [string]: RawOpcodeType } = {};
export const opcodeMap = [];
export const textMap = {};
const ___ = null;

/**
 * Convert Opcode definiton to usable object(s)
 **/
const opcode = (
  result: ?number,
  first: ?number,
  second: ?number,
  size: number,
  code: number,
  name: string,
  text: string
) => {
  const definition: RawOpcodeType = {
    result,
    first,
    second,
    size,
    code,
    name,
    text,
  };

  def[name] = definition;
  opcodeMap[code] = definition;
  textMap[text] = definition;

  return definition;
};

opcode(___, ___, ___, 0, 0x00, 'Unreachable', 'unreachable');
opcode(___, ___, ___, 0, 0x01, 'Nop', 'nop');
opcode(___, ___, ___, 0, 0x02, 'Block', 'block');
opcode(___, ___, ___, 0, 0x03, 'Loop', 'loop');
opcode(___, ___, ___, 0, 0x04, 'If', 'if');
opcode(___, ___, ___, 0, 0x05, 'Else', 'else');
opcode(___, ___, ___, 0, 0x06, 'Try', 'try');
opcode(___, ___, ___, 0, 0x07, 'Catch', 'catch');
opcode(___, ___, ___, 0, 0x08, 'Throw', 'throw');
opcode(___, ___, ___, 0, 0x09, 'Rethrow', 'rethrow');
opcode(___, ___, ___, 0, 0x0a, 'CatchAll', 'catch_all');
opcode(___, ___, ___, 0, 0x0b, 'End', 'end');
opcode(___, ___, ___, 0, 0x0c, 'Br', 'br');
opcode(___, ___, ___, 0, 0x0d, 'BrIf', 'br_if');
opcode(___, ___, ___, 0, 0x0e, 'BrTable', 'br_table');
opcode(___, ___, ___, 0, 0x0f, 'Return', 'return');
opcode(___, ___, ___, 0, 0x10, 'Call', 'call');
opcode(___, ___, ___, 0, 0x11, 'CallIndirect', 'call_indirect');
opcode(___, ___, ___, 0, 0x1a, 'Drop', 'drop');
opcode(___, ___, ___, 0, 0x1b, 'Select', 'select');
opcode(___, ___, ___, 0, 0x20, 'GetLocal', 'get_local');
opcode(___, ___, ___, 0, 0x21, 'SetLocal', 'set_local');
opcode(___, ___, ___, 0, 0x22, 'TeeLocal', 'tee_local');
opcode(___, ___, ___, 0, 0x23, 'GetGlobal', 'get_global');
opcode(___, ___, ___, 0, 0x24, 'SetGlobal', 'set_global');
opcode(i32, i32, ___, 4, 0x28, 'i32Load', 'i32.load');
opcode(i64, i32, ___, 8, 0x29, 'i64Load', 'i64.load');
opcode(f32, i32, ___, 4, 0x2a, 'f32Load', 'f32.load');
opcode(f64, i32, ___, 8, 0x2b, 'f64Load', 'f64.load');
opcode(i32, i32, ___, 1, 0x2c, 'i32Load8S', 'i32.load8_s');
opcode(i32, i32, ___, 1, 0x2d, 'i32Load8U', 'i32.load8_u');
opcode(i32, i32, ___, 2, 0x2e, 'i32Load16S', 'i32.load16_s');
opcode(i32, i32, ___, 2, 0x2f, 'i32Load16U', 'i32.load16_u');
opcode(i64, i32, ___, 1, 0x30, 'i64Load8S', 'i64.load8_s');
opcode(i64, i32, ___, 1, 0x31, 'i64Load8U', 'i64.load8_u');
opcode(i64, i32, ___, 2, 0x32, 'i64Load16S', 'i64.load16_s');
opcode(i64, i32, ___, 2, 0x33, 'i64Load16U', 'i64.load16_u');
opcode(i64, i32, ___, 4, 0x34, 'i64Load32S', 'i64.load32_s');
opcode(i64, i32, ___, 4, 0x35, 'i64Load32U', 'i64.load32_u');
opcode(___, i32, i32, 4, 0x36, 'i32Store', 'i32.store');
opcode(___, i32, i64, 8, 0x37, 'i64Store', 'i64.store');
opcode(___, i32, f32, 4, 0x38, 'f32Store', 'f32.store');
opcode(___, i32, f32, 8, 0x39, 'f64Store', 'f64.store');
opcode(___, i32, i32, 1, 0x3a, 'i32Store8', 'i32.store8');
opcode(___, i32, i32, 2, 0x3b, 'i32Store16', 'i32.store16');
opcode(___, i32, i64, 1, 0x3c, 'i64Store8', 'i64.store8');
opcode(___, i32, i64, 2, 0x3d, 'i64Store16', 'i64.store16');
opcode(___, i32, i64, 4, 0x3e, 'i64Store32', 'i64.store32');
opcode(i32, ___, ___, 0, 0x3f, 'CurrentMemory', 'current_memory');
opcode(i32, i32, ___, 0, 0x40, 'GrowMemory', 'grow_memory');
opcode(i32, ___, ___, 0, 0x41, 'i32Const', 'i32.const');
opcode(i64, ___, ___, 0, 0x42, 'i64Const', 'i64.const');
opcode(f32, ___, ___, 0, 0x43, 'f32Const', 'f32.const');
opcode(f64, ___, ___, 0, 0x44, 'f64Const', 'f64.const');
opcode(i32, i32, ___, 0, 0x45, 'i32Eqz', 'i32.eqz');
opcode(i32, i32, i32, 0, 0x46, 'i32Eq', 'i32.eq');
opcode(i32, i32, i32, 0, 0x47, 'i32Ne', 'i32.ne');
opcode(i32, i32, i32, 0, 0x48, 'i32LtS', 'i32.lt_s');
opcode(i32, i32, i32, 0, 0x49, 'i32LtU', 'i32.lt_u');
opcode(i32, i32, i32, 0, 0x4a, 'i32GtS', 'i32.gt_s');
opcode(i32, i32, i32, 0, 0x4b, 'i32GtU', 'i32.gt_u');
opcode(i32, i32, i32, 0, 0x4c, 'i32LeS', 'i32.le_s');
opcode(i32, i32, i32, 0, 0x4d, 'i32LeU', 'i32.le_u');
opcode(i32, i32, i32, 0, 0x4e, 'i32GeS', 'i32.ge_s');
opcode(i32, i32, i32, 0, 0x4f, 'i32GeU', 'i32.ge_u');
opcode(i32, i64, ___, 0, 0x50, 'i64Eqz', 'i64.eqz');
opcode(i32, i64, i64, 0, 0x51, 'i64Eq', 'i64.eq');
opcode(i32, i64, i64, 0, 0x52, 'i64Ne', 'i64.ne');
opcode(i32, i64, i64, 0, 0x53, 'i64LtS', 'i64.lt_s');
opcode(i32, i64, i64, 0, 0x54, 'i64LtU', 'i64.lt_u');
opcode(i32, i64, i64, 0, 0x55, 'i64GtS', 'i64.gt_s');
opcode(i32, i64, i64, 0, 0x56, 'i64GtU', 'i64.gt_u');
opcode(i32, i64, i64, 0, 0x57, 'i64LeS', 'i64.le_s');
opcode(i32, i64, i64, 0, 0x58, 'i64LeU', 'i64.le_u');
opcode(i32, i64, i64, 0, 0x59, 'i64GeS', 'i64.ge_s');
opcode(i32, i64, i64, 0, 0x5a, 'i64GeU', 'i64.ge_u');
opcode(i32, f32, f32, 0, 0x5b, 'f32Eq', 'f32.eq');
opcode(i32, f32, f32, 0, 0x5c, 'f32Ne', 'f32.ne');
opcode(i32, f32, f32, 0, 0x5d, 'f32Lt', 'f32.lt');
opcode(i32, f32, f32, 0, 0x5e, 'f32Gt', 'f32.gt');
opcode(i32, f32, f32, 0, 0x5f, 'f32Le', 'f32.le');
opcode(i32, f32, f32, 0, 0x60, 'f32Ge', 'f32.ge');
opcode(i32, f32, f32, 0, 0x61, 'f64Eq', 'f64.eq');
opcode(i32, f32, f32, 0, 0x62, 'f64Ne', 'f64.ne');
opcode(i32, f32, f32, 0, 0x63, 'f64Lt', 'f64.lt');
opcode(i32, f32, f32, 0, 0x64, 'f64Gt', 'f64.gt');
opcode(i32, f32, f32, 0, 0x65, 'f64Le', 'f64.le');
opcode(i32, f32, f32, 0, 0x66, 'f64Ge', 'f64.ge');
opcode(i32, i32, ___, 0, 0x67, 'i32Clz', 'i32.clz');
opcode(i32, i32, ___, 0, 0x68, 'i32Ctz', 'i32.ctz');
opcode(i32, i32, ___, 0, 0x69, 'i32Popcnt', 'i32.popcnt');
opcode(i32, i32, i32, 0, 0x6a, 'i32Add', 'i32.add');
opcode(i32, i32, i32, 0, 0x6b, 'i32Sub', 'i32.sub');
opcode(i32, i32, i32, 0, 0x6c, 'i32Mul', 'i32.mul');
opcode(i32, i32, i32, 0, 0x6d, 'i32DivS', 'i32.div_s');
opcode(i32, i32, i32, 0, 0x6e, 'i32DivU', 'i32.div_u');
opcode(i32, i32, i32, 0, 0x6f, 'i32RemS', 'i32.rem_s');
opcode(i32, i32, i32, 0, 0x70, 'i32RemU', 'i32.rem_u');
opcode(i32, i32, i32, 0, 0x71, 'i32And', 'i32.and');
opcode(i32, i32, i32, 0, 0x72, 'i32Or', 'i32.or');
opcode(i32, i32, i32, 0, 0x73, 'i32Xor', 'i32.xor');
opcode(i32, i32, i32, 0, 0x74, 'i32Shl', 'i32.shl');
opcode(i32, i32, i32, 0, 0x75, 'i32ShrS', 'i32.shr_s');
opcode(i32, i32, i32, 0, 0x76, 'i32ShrU', 'i32.shr_u');
opcode(i32, i32, i32, 0, 0x77, 'i32Rotl', 'i32.rotl');
opcode(i32, i32, i32, 0, 0x78, 'i32Rotr', 'i32.rotr');
opcode(i64, i64, ___, 0, 0x79, 'i64Clz', 'i64.clz');
opcode(i64, i64, ___, 0, 0x7a, 'i64Ctz', 'i64.ctz');
opcode(i64, i64, ___, 0, 0x7b, 'i64Popcnt', 'i64.popcnt');
opcode(i64, i64, i64, 0, 0x7c, 'i64Add', 'i64.add');
opcode(i64, i64, i64, 0, 0x7d, 'i64Sub', 'i64.sub');
opcode(i64, i64, i64, 0, 0x7e, 'i64Mul', 'i64.mul');
opcode(i64, i64, i64, 0, 0x7f, 'i64DivS', 'i64.div_s');
opcode(i64, i64, i64, 0, 0x80, 'i64DivU', 'i64.div_u');
opcode(i64, i64, i64, 0, 0x81, 'i64RemS', 'i64.rem_s');
opcode(i64, i64, i64, 0, 0x82, 'i64RemU', 'i64.rem_u');
opcode(i64, i64, i64, 0, 0x83, 'i64And', 'i64.and');
opcode(i64, i64, i64, 0, 0x84, 'i64Or', 'i64.or');
opcode(i64, i64, i64, 0, 0x85, 'i64Xor', 'i64.xor');
opcode(i64, i64, i64, 0, 0x86, 'i64Shl', 'i64.shl');
opcode(i64, i64, i64, 0, 0x87, 'i64ShrS', 'i64.shr_s');
opcode(i64, i64, i64, 0, 0x88, 'i64ShrU', 'i64.shr_u');
opcode(i64, i64, i64, 0, 0x89, 'i64Rotl', 'i64.rotl');
opcode(i64, i64, i64, 0, 0x8a, 'i64Rotr', 'i64.rotr');
opcode(f32, f32, f32, 0, 0x8b, 'f32Abs', 'f32.abs');
opcode(f32, f32, f32, 0, 0x8c, 'f32Neg', 'f32.neg');
opcode(f32, f32, f32, 0, 0x8d, 'f32Ceil', 'f32.ceil');
opcode(f32, f32, f32, 0, 0x8e, 'f32Floor', 'f32.floor');
opcode(f32, f32, f32, 0, 0x8f, 'f32Trunc', 'f32.trunc');
opcode(f32, f32, f32, 0, 0x90, 'f32Nearest', 'f32.nearest');
opcode(f32, f32, f32, 0, 0x91, 'f32Sqrt', 'f32.sqrt');
opcode(f32, f32, f32, 0, 0x92, 'f32Add', 'f32.add');
opcode(f32, f32, f32, 0, 0x93, 'f32Sub', 'f32.sub');
opcode(f32, f32, f32, 0, 0x94, 'f32Mul', 'f32.mul');
opcode(f32, f32, f32, 0, 0x95, 'f32Div', 'f32.div');
opcode(f32, f32, f32, 0, 0x96, 'f32Min', 'f32.min');
opcode(f32, f32, f32, 0, 0x97, 'f32Max', 'f32.max');
opcode(f32, f32, f32, 0, 0x98, 'f32Copysign', 'f32.copysign');
opcode(f32, f32, f32, 0, 0x99, 'f32Abs', 'f64.abs');
opcode(f32, f32, f32, 0, 0x9a, 'f32Neg', 'f64.neg');
opcode(f32, f32, f32, 0, 0x9b, 'f32Ceil', 'f64.ceil');
opcode(f32, f32, f32, 0, 0x9c, 'f32Floor', 'f64.floor');
opcode(f32, f32, f32, 0, 0x9d, 'f32Trunc', 'f64.trunc');
opcode(f32, f32, f32, 0, 0x9e, 'f32Nearest', 'f64.nearest');
opcode(f32, f32, f32, 0, 0x9f, 'f32Sqrt', 'f64.sqrt');
opcode(f64, f64, f64, 0, 0xa0, 'f64Add', 'f64.add');
opcode(f64, f64, f64, 0, 0xa1, 'f64Sub', 'f64.sub');
opcode(f64, f64, f64, 0, 0xa2, 'f64Mul', 'f64.mul');
opcode(f64, f64, f64, 0, 0xa3, 'f64Div', 'f64.div');
opcode(f64, f64, f64, 0, 0xa4, 'f64Min', 'f64.min');
opcode(f64, f64, f64, 0, 0xa5, 'f64Max', 'f64.max');
opcode(f64, f64, f64, 0, 0xa6, 'f64Copysign', 'f64.copysign');
opcode(i32, i64, ___, 0, 0xa7, 'i32Wrapi64', 'i32.wrap/i64');
opcode(i32, f32, ___, 0, 0xa8, 'i32TruncSf32', 'i32.trunc_s/f32');
opcode(i32, f32, ___, 0, 0xa9, 'i32TruncUf32', 'i32.trunc_u/f32');
opcode(i32, f32, ___, 0, 0xaa, 'i32TruncSf64', 'i32.trunc_s/f64');
opcode(i32, f32, ___, 0, 0xab, 'i32TruncUf64', 'i32.trunc_u/f64');
opcode(i64, i32, ___, 0, 0xac, 'i64ExtendSi32', 'i64.extend_s/i32');
opcode(i64, i32, ___, 0, 0xad, 'i64ExtendUi32', 'i64.extend_u/i32');
opcode(i64, f32, ___, 0, 0xae, 'i64TruncSf32', 'i64.trunc_s/f32');
opcode(i64, f32, ___, 0, 0xaf, 'i64TruncUf32', 'i64.trunc_u/f32');
opcode(i64, f32, ___, 0, 0xb0, 'i64TruncSf64', 'i64.trunc_s/f64');
opcode(i64, f32, ___, 0, 0xb1, 'i64TruncUf64', 'i64.trunc_u/f64');
opcode(f32, i32, ___, 0, 0xb2, 'f32ConvertSi32', 'f32.convert_s/i32');
opcode(f32, i32, ___, 0, 0xb3, 'f32ConvertUi32', 'f32.convert_u/i32');
opcode(f32, i64, ___, 0, 0xb4, 'f32ConvertSi64', 'f32.convert_s/i64');
opcode(f32, i64, ___, 0, 0xb5, 'f32ConvertUi64', 'f32.convert_u/i64');
opcode(f32, f32, ___, 0, 0xb6, 'f32Demotef64', 'f32.demote/f64');
opcode(f32, i32, ___, 0, 0xb7, 'f64ConvertSi32', 'f64.convert_s/i32');
opcode(f32, i32, ___, 0, 0xb8, 'f64ConvertUi32', 'f64.convert_u/i32');
opcode(f32, i64, ___, 0, 0xb9, 'f64ConvertSi64', 'f64.convert_s/i64');
opcode(f32, i64, ___, 0, 0xba, 'f64ConvertUi64', 'f64.convert_u/i64');
opcode(f32, f32, ___, 0, 0xbb, 'f64Promotef32', 'f64.promote/f32');
opcode(i32, f32, ___, 0, 0xbc, 'i32Reinterpretf32', 'i32.reinterpret/f32');
opcode(i64, f32, ___, 0, 0xbd, 'i64Reinterpretf64', 'i64.reinterpret/f64');
opcode(f32, i32, ___, 0, 0xbe, 'f32Reinterpreti32', 'f32.reinterpret/i32');
opcode(f32, i64, ___, 0, 0xbf, 'f32Reinterpreti64', 'f64.reinterpret/i64');

export const getTypecastOpcode = (to: string, from: string): RawOpcodeType => {
  const toType = to[0];

  if (['i32', 'bool'].includes(to) && from === 'i64') {
    return def.i32Wrapi64;
  }
  if (to === 'i64' && ['i32', 'bool'].includes(from)) {
    return def.i64ExtendSi32;
  }

  if (to === 'f32' && from === 'f64') {
    return def.f32Demotef64;
  }
  if (to === 'f64' && from === 'f32') {
    return def.f64Promotef32;
  }

  const conversion = toType === 'f' ? 'ConvertS' : 'TruncS';
  return def[to + conversion + from];
};

/**
 * Return opcode mapping to the operator. Signed result is always preferred
 */
export const opcodeFromOperator = ({
  type,
  value,
}: {
  type: string | null,
  value: string,
}): RawOpcodeType => {
  // 100% code coverage is a harsh mistress
  const mapping = {
    '+': def[String(type) + 'Add'],
    '-': def[String(type) + 'Sub'],
    '*': def[String(type) + 'Mul'],
    '/': def[String(type) + 'DivS'] || def[String(type) + 'Div'],
    '%': def[String(type) + 'RemS'] || def[String(type) + 'RemU'],
    '==': def[String(type) + 'Eq'],
    '!=': def[String(type) + 'Ne'],
    '>': def[String(type) + 'Gt'] || def[String(type) + 'GtS'],
    '<': def[String(type) + 'Lt'] || def[String(type) + 'LtS'],
    '<=': def[String(type) + 'Le'] || def[String(type) + 'LeS'],
    '>=': def[String(type) + 'Ge'] || def[String(type) + 'GeS'],
    '?': def.If,
    ':': def.Else,
    '&': def[String(type) + 'And'],
    '|': def[String(type) + 'Or'],
    '^': def[String(type) + 'Xor'],
    '>>': def[String(type) + 'ShrS'],
    '>>>': def[String(type) + 'ShrU'],
    '<<': def[String(type) + 'Shl'],
  };

  return mapping[value];
};

export default def;
