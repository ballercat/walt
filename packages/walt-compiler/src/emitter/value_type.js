// @flow
export const I32 = 0x7f;
export const I64 = 0x7e;
export const F32 = 0x7d;
export const F64 = 0x7c;
export const ANYFUNC = 0x70;
export const FUNC = 0x60;
export const BLOCK_TYPE = 0x40;

export const stringToType = {
  i32: I32,
  i64: I64,
  f32: F32,
  f64: F64,
};

export const getTypeString = (type: number) => {
  switch (type) {
    case I64:
      return 'i64';
    case F32:
      return 'f32';
    case F64:
      return 'f64';
    case FUNC:
      return 'func';
    case ANYFUNC:
      return 'anyfunc';
    case I32:
    default:
      return 'i32';
  }
};
