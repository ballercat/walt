// More or less JavaScript precedence
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

export const PRECEDENCE_PARAMS = -99;
export const PRECEDENCE_COMMA = -2;
export const PRECEDENCE_ADDITION = 0;
export const PRECEDENCE_SUBTRACTION = 0;
export const PRECEDENCE_MULTIPLY = 1;
export const PRECEDENCE_DIVIDE = 1;
export const PRECEDENCE_INCREMENT = 2;
export const PRECEDENCE_DECREMENT = 2;

export const PRECEDENCE_FUNCTION_CALL = 19;
export const PRECEDENCE_KEY_VALUE_PAIR = -1;

const precedence = {
  "(": PRECEDENCE_PARAMS,
  ",": PRECEDENCE_COMMA,
  "+": PRECEDENCE_ADDITION,
  "-": PRECEDENCE_SUBTRACTION,
  "*": PRECEDENCE_MULTIPLY,
  "/": PRECEDENCE_DIVIDE,
  "++": PRECEDENCE_INCREMENT,
  "--": 2,
  "==": 2,
  "!=": 2,
  "=": 3,
  "-=": 3,
  "+=": 3,
  ":": 4,
  "?": 4,
  ">": 5,
  "<": 5,
  ":": PRECEDENCE_KEY_VALUE_PAIR
};
export default precedence;
