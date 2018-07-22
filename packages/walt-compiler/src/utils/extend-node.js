import curry from "curry";

export const extendNode = curry((options, node) => {
  return {
    ...node,
    ...options,
  };
});
