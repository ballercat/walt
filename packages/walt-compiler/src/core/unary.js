import Syntax from '../Syntax';
import { expressionFragment as fragment } from '../parser/fragment';

// Unary expressions need to be patched so that the LHS type matches the RHS
export default function() {
  return {
    semantics() {
      return {
        UnaryExpression: _ignore => (args, transform) => {
          const [unaryNode, context] = args;
          // While it's counter-intuitive that an unary operation would have two operands
          // it is simpler to always parse them as pseudo-binary and then simplify them here.
          const [lhs, rhs] = unaryNode.params.map(p => transform([p, context]));
          switch (unaryNode.value) {
            // Transform bang
            case '!':
              const shift = ['i64', 'f64'].includes(lhs.type) ? '63' : '31';
              return transform([
                fragment(
                  `(((${String(lhs)} >> ${shift}) | ((~${String(
                    lhs
                  )} + 1) >> ${shift})) + 1)`
                ),
                context,
              ]);
            case '~':
              const mask = ['i64', 'f64'].includes(
                transform([lhs, context]).type
              )
                ? '0xffffffffffff'
                : '0xffffff';
              return transform([
                fragment(`(${String(lhs)} ^ ${mask})`),
                context,
              ]);
            default:
              return transform([
                {
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
                },
                context,
              ]);
          }
        },
      };
    },
  };
}
