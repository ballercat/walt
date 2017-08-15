import Syntax from './../Syntax';
import curry from 'curry';

const Node = {
  declaration: curry(
    (decl,
    { start },
    { value: id },
    { value: typedef, end }
  ) => ({
      type: Syntax.Declaration,
      constant: decl.value === 'const',
      start,
      end,
      id,
      typedef
  })),
  assignment: (start, end, left, right) => {
    return {
      type: Syntax.Assignment,
      start,
      end,
      left,
      right
    };
  },
  constant: (start, end, value) => {
    return {
      type: Syntax.Constant,
      start,
      end,
      value
    };
  },
  identifier: (start, end, id) => {
    return {
      type: Syntax.Identifier,
      start,
      end,
      id
    };
  },
  binaryExpression: (operator, left, right) => {
    return {
      type: Syntax.BinaryExpression,
      start: left.start,
      end: right.end,
      operator: operator
    };
  },
  export: (node) => ({ ...node, export: true })
};

export default Node;

