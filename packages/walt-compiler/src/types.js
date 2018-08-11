// @flow
export const sizes = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};

export const typeWeight = (typeString: ?string): number => {
  switch (typeString) {
    case 'i32':
    case 'bool':
      return 0;
    case 'i64':
      return 1;
    case 'f32':
      return 2;
    case 'f64':
      return 3;
    default:
      return -1;
  }
};
