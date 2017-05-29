const {
  keyword,
  operator,
  punctuation,
  identifier,
  constant,
  type
} = require('./../parser');

module.exports = {
  declaration: [
    'let x: i32',
    'let x: i32 = 42',
    'const x: i32',
    'const x : i32 = 42',
  ],
  assignment: {
    'x = 1': true,
    'x = y': true,
    '1 = x': false,
    '1 = 0': false
  }
};


