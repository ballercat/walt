// @flow
import curry from 'curry';
import Syntax from '../Syntax';
import { CLOSURE_TYPE } from './metadata';

export const mapGeneric = curry((options, node, _) => {
  const { types } = options;
  const [generic, T] = node.params;
  const realType = types[T.value];
  const [args, result] = realType.params;
  // Patch the node to be a real type which we can reference later
  const patch = {
    ...realType,
    range: generic.range,
    value: node.value,
    meta: { ...realType.meta, [CLOSURE_TYPE]: generic.value === 'Lambda' },
    params: [
      {
        ...args,
        params: [
          {
            ...args,
            params: [],
            type: 'i32',
            value: 'i32',
            Type: Syntax.Type,
          },
          ...args.params,
        ],
      },
      result,
    ],
  };
  types[patch.value] = patch;
  return patch;
});
