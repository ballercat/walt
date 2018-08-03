import Syntax from '../Syntax';
import { expressionFragment as fragment } from '../parser/fragment';
import type { NodeType } from '../flow/types';

// Unary expressions need to be patched so that the LHS type matches the RHS
export default function(unaryNode, transform): NodeType {
  // While it's counter-intuitive that an unary operation would have two operands
  // it is simpler to always parse them as pseudo-binary and then simplify them here.
  const [lhs, rhs] = unaryNode.params.map(transform);
  switch (unaryNode.value) {
    // Transform bang
    case '!':
      const shift = ['i64', 'f64'].includes(lhs.type) ? '63' : '31';
      return transform(
        fragment(
          `(((${String(lhs)} >> ${shift}) | ((~${String(
            lhs
          )} + 1) >> ${shift})) + 1)`
        )
      );
    case '~':
      const mask = ['i64', 'f64'].includes(transform(lhs).type)
        ? '0xffffffffffff'
        : '0xffffff';
      return transform(fragment(`(${String(lhs)} ^ ${mask})`));
    default:
      return {
        ...unaryNode,
        type: rhs.type,
        params: [
          {
            ...lhs,
            type: rhs.type,
          },
          rhs,
        ],
        Type: Syntax.BinaryExpression,
      };
  }
}
