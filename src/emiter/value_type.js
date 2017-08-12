export const getTypeString = (type) => {
  switch(type) {
    case I32:
      return 'i32';
    case I64:
      return 'i64';
    case F32:
      return 'f32';
    case F64:
      return 'f64';
    case ANYFUNC:
      return 'anyfunc';
    default:
      return '?'
  }
};

export const I32 = 0x7F;
export const I64 = 0x7E;
export const F32 = 0x7D;
export const F64 = 0x7C;
export const ANYFUNC = 0x70;
export const FUNC = 0x60;
export const BLOCK_TYPE = 0x40;

