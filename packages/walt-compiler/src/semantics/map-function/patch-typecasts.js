// @flow
import Syntax from '../../Syntax';
import { TYPE_CAST } from '../metadata';
import { typeWeight } from '../../types';
import type { NodeType } from '../../flow/types';

export const balanceTypesInMathExpression = (
  expression: NodeType
): NodeType => {
  // find the heaviest type in the expression
  const type = expression.params.reduce((acc, { type: childType }) => {
    // The way we do that is by scanning the top-level nodes in our expression
    if (typeWeight(acc) < typeWeight(childType)) {
      return childType;
    }

    return acc;
  }, expression.type);

  // iterate again, this time, patching any lighter types
  const params = expression.params.map(paramNode => {
    if (
      paramNode.type != null &&
      typeWeight(paramNode.type) !== typeWeight(type)
    ) {
      return {
        ...paramNode,
        type,
        value: paramNode.value,
        Type: Syntax.TypeCast,
        meta: {
          ...paramNode.meta,
          [TYPE_CAST]: { to: type, from: paramNode.type },
        },
        params: [paramNode],
      };
    }

    return paramNode;
  });

  return {
    ...expression,
    params,
    type,
  };
};
