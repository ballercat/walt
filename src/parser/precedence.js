// Utilities
const precedence = {
  '+': 0,
  '-': 0,
  '*': 1,
  '/': 1,
  '++': 2,
  '--': 2,
  '==': 2,
  '!=': 2,
  '=': 3,
  ':': 4,
  '?': 4,
  '>': 5,
  '<': 5
};
export default precedence;

