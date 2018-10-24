/**
 * Walks over every node in the tree, applying the approriate visitor callback to
 * each specified node Type. Similar to mapNode() method, but without the mapping.
 *
 * @kind function
 * @name  walkNode
 * @param {Object} visitor Key value map of visitors
 *
 * @returns {NodeType} Original Node
 */
module.exports = function walker(visitor) {
  const walkNode = node => {
    if (node == null) {
      return node;
    }
    const { params } = node;

    const mappingFunction = (() => {
      if ('*' in visitor && typeof visitor['*'] === 'function') {
        return visitor['*'];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === 'function') {
        return visitor[node.Type];
      }

      return () => node;
    })();

    if (mappingFunction.length === 2) {
      mappingFunction(node, walkNode);
      return node;
    }

    mappingFunction(node);
    params.forEach(walkNode);

    return node;
  };

  return walkNode;
};
