export const getTypeSize = typeString => {
  switch (typeString) {
    case 'i64':
    case 'f64':
      return 8;
    case 'i32':
    case 'f32':
    case 'bool':
    default:
      return 4;
  }
};
