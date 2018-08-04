// @flow

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
