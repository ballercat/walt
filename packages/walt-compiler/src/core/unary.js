import Syntax from 'walt-syntax';
import { expressionFragment as fragment } from '../parser/fragment';

const shifts = {
  i64: 63,
  f64: 63,
  i32: 31,
  f32: 32,
};
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
              const shift = shifts[lhs.type];
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
        MemoryAssignment: next => args => {
          const [assign, context] = args;
          if (!['-=', '+='].includes(assign.value)) {
            return next(args);
          }

          const operator = assign.value[0];
          const [target, amount] = assign.params;

          return next([
            {
              ...assign,
              value: '=',
              params: [
                target,
                {
                  ...target,
                  Type: Syntax.BinaryExpression,
                  value: operator,
                  params: [target, amount],
                },
              ],
            },
            context,
          ]);
        },
        Assignment: next => args => {
          const [assign, context] = args;
          if (!['-=', '+='].includes(assign.value)) {
            return next(args);
          }

          const operator = assign.value[0];
          const [target, amount] = assign.params;

          return next([
            {
              ...assign,
              value: '=',
              params: [
                target,
                {
                  ...target,
                  Type: Syntax.BinaryExpression,
                  value: operator,
                  params: [target, amount],
                },
              ],
            },
            context,
          ]);
        },
      };
    },
  };
}
