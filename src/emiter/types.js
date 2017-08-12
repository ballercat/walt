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


