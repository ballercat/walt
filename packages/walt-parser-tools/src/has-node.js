/**
 * Check if an AST has a specific Node Type, return boolean
 *
 */
module.exports = function hasNode(Type, ast) {
  const test = node => node && node.Type === Type;

  const walker = node => {
    if (node == null) {
      return false;
    }

    return test(node) || node.params.some(walker);
  };

  return walker(ast);
};
