const Syntax = require('./../Syntax');

const declaration = (start, end, id, typedef) => {
  return {
    type: Syntax.Declaration,
    start,
    end,
    id,
    typedef
  };
};

const assignment = (start, end, left, right) => {
  return {
    type: Syntax.Assignment,
    start,
    end,
    left,
    right
  };
};

const constant = (start, end, value) => {
  return {
    type: Syntax.Constant,
    start,
    end,
    value
  };
};

const identifier = (start, end, id) => {
  return {
    type: Syntax.Identifier,
    start,
    end,
    id
  };
};

const binaryExpression = (operator, left, right) => {
  return {
    type: Syntax.BinaryExpression,
    start: left.start,
    end: right.end,
    operator: operator
  };
};

module.exports = {
  declaration,
  assignment,
  constant,
  identifier,
  binaryExpression
}

