const extend = require('xtend');

const identity = id => id;

function map(visitors) {
  function mapper(input) {
    if (!Array.isArray(input)) {
      throw new Error(
        'Transform must be used on an Array. Received ' + JSON.stringify(input)
      );
    }
    const visitor = (() => {
      const [node] = input;
      if (node.Type in visitors && typeof visitors[node.Type] === 'function') {
        return visitors[node.Type];
      }
      return identity;
    })();

    if (visitor.length === 2) {
      return visitor(input, mapper);
    }

    const [node, ...rest] = visitor(input);
    const params = node.params
      .filter(Boolean)
      .map(child => mapper([child, ...rest]));

    return extend(node, { params });
  }

  return mapper;
}

// This should maybe be it's own module.
function mapNode(visitor) {
  const nodeMapper = node => {
    if (node == null) {
      return node;
    }

    const mappingFunction = (() => {
      if ('*' in visitor && typeof visitor['*'] === 'function') {
        return visitor['*'];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === 'function') {
        return visitor[node.Type];
      }
      return identity;
    })();

    if (mappingFunction.length === 2) {
      return mappingFunction(node, nodeMapper);
    }

    const mappedNode = mappingFunction(node);
    const params = mappedNode.params.map(nodeMapper);

    return extend(mappedNode, { params });
  };

  return nodeMapper;
}

module.exports = {
  map,
  mapNode,
};
