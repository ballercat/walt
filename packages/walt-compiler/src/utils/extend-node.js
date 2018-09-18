import curry from 'curry';

export const extendNode = curry(({ meta, ...options }, node) => {
  return {
    ...node,
    meta: { ...node.meta, ...meta },
    ...options,
  };
});
