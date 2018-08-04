// @flow
// More or less JavaScript precedence
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

export const PRECEDENCE_MEMBER_ACCESS = 19;
export const PRECEDENCE_FUNCTION_CALL = 19;
export const PRECEDENCE_NOT = 18;
export const PRECEDENCE_ASSIGNMENT = 3;
export const PRECEDENCE_INCREMENT = 2;
export const PRECEDENCE_DECREMENT = 2;
export const PRECEDENCE_DIVIDE = 1;
export const PRECEDENCE_MULTIPLY = 1;
export const PRECEDENCE_ADDITION = 0;
export const PRECEDENCE_SUBTRACTION = 0;
export const PRECEDENCE_SHIFT = -1;
export const PRECEDENCE_COMMA = -2;
export const PRECEDENCE_BITWISE_XOR = -2;
export const PRECEDENCE_SPREAD = -1;
export const PRECEDENCE_BITWISE_AND = -1;
export const PRECEDENCE_BITWISE_OR = -3;
export const PRECEDENCE_LOGICAL_AND = -4;

export const PRECEDENCE_LOGICAL_OR = -5;
export const PRECEDENCE_KEY_VALUE_PAIR = -1;

export const PRECEDENCE_PARAMS = -99;

const precedence = {
  '=>': PRECEDENCE_PARAMS,
  '(': PRECEDENCE_PARAMS,
  ',': PRECEDENCE_COMMA,
  as: PRECEDENCE_COMMA + 1,
  '>>': PRECEDENCE_SHIFT,
  '>>>': PRECEDENCE_SHIFT,
  '<<': PRECEDENCE_SHIFT,
  '+': PRECEDENCE_ADDITION,
  '-': PRECEDENCE_SUBTRACTION,
  '*': PRECEDENCE_MULTIPLY,
  '/': PRECEDENCE_DIVIDE,
  '==': 2,
  '!=': 2,
  '.': PRECEDENCE_MEMBER_ACCESS,
  '=': -1,
  '-=': PRECEDENCE_ASSIGNMENT,
  '+=': PRECEDENCE_ASSIGNMENT,
  '?': 4,
  '>': 5,
  '<': 5,
  ':': PRECEDENCE_KEY_VALUE_PAIR,
  '^': PRECEDENCE_BITWISE_XOR,
  '&': PRECEDENCE_BITWISE_AND,
  '|': PRECEDENCE_BITWISE_OR,
  '&&': PRECEDENCE_LOGICAL_AND,
  '||': PRECEDENCE_LOGICAL_OR,
  '...': PRECEDENCE_SPREAD,
  '~': PRECEDENCE_NOT,
  '!': PRECEDENCE_NOT,
};

export default precedence;
