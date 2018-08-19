import Syntax from 'walt-syntax';
import walkNode from './walk-node';

export const parseBounds = node => {
  const memory = {};
  walkNode({
    [Syntax.Pair]: ({ params }) => {
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    },
  })(node);
  return memory;
};
