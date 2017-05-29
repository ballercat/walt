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
    'global x : i32',
    'const x : i32',
    'global const x : i32',
    'global x : i32 = 42'
  ],
  assignment: {
    'x = 1': true,
    'x = y': true,
    '1 = x': false,
    '1 = 0': false
  }
};


