const {
  keyword,
  operator,
  punctuation,
  identifier,
  constant,
  type
} = require('./../parser');

module.exports = {
  declaration: {
    'global i32 x': true,
    'const i32 x': true,
    'global const i32 x': true,
    'const global x': false,
    'const x': false
  },
  assignment: {
    'x = 1': true
  }
};

