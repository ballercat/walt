/**
 * Unary operator plugin.
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import type { SemanticPlugin } from '../flow/types';

const shifts = {
  i64: 63,
  f64: 63,
  i32: 31,
  f32: 32,
};
// Unary expressions need to be patched so that the LHS type matches the RHS
export default function(): SemanticPlugin {
  return {
    semantics({ stmt }) {
      return {
        [Syntax.UnaryExpression]: _ignore => (args, transform) => {
          const [unaryNode, context] = args;
          // While it's counter-intuitive that an unary operation would have two operands
          // it is simpler to always parse them as pseudo-binary and then simplify them here.
          const [lhs, rhs] = unaryNode.params.map(p => transform([p, context]));
          switch (unaryNode.value) {
            // Transform bang
            case '!':
              const shift = shifts[lhs.type];
              return transform([
                stmt`(((${lhs} >> ${shift}) | ((~${lhs} + 1) >> ${shift})) + 1);`,
                context,
              ]);
            case '~':
              const mask = ['i64', 'f64'].includes(
                transform([lhs, context]).type
              )
                ? '0xffffffffffff'
                : '0xffffff';
              return transform([stmt`(${lhs} ^ ${mask});`, context]);
            case '-':
              // Fold negation into a single opcode (a negative constant).
              // The parser _currently_ generates 0 - <const> node pairs instead
              if (rhs.Type === Syntax.Constant) {
                return {
                  ...rhs,
                  meta: {
                    ...rhs.meta,
                    // Hint for generator
                    SIGN: -1,
                  },
                };
              }
            // fallthrough
            // eslint-disable-next-line
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
