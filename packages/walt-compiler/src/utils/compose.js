// @flow
export default (...fns: any) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));
