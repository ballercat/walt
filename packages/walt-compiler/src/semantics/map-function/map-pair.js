// @flow
import curry from 'curry';
import Syntax from '../../Syntax';
import { TYPE_CAST } from '../metadata';
import type { NodeType } from '../../flow/types';

export default curry(
  (options, typeCastMaybe: NodeType, transform): NodeType => {
    const [targetNode, typeNode] = typeCastMaybe.params.map(transform);

    const { type: from } = targetNode;
    const { value: to } = typeNode;

    // If both sides of a pair don't have types then it's not a typecast,
    // more likely a string: value pair in an object for example
    if (typeNode.Type === Syntax.Type && !!from && !!to) {
      return {
        ...typeCastMaybe,
        type: to,
        value: targetNode.value,
        Type: Syntax.TypeCast,
        meta: { ...typeCastMaybe.meta, [TYPE_CAST]: { to, from } },
        // We need to drop the typeNode here, because it's not something we can generate
        params: [targetNode],
      };
    }

    return {
      ...typeCastMaybe,
      params: typeCastMaybe.params.map(transform),
    };
  }
);
