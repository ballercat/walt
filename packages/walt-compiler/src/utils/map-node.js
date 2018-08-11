const identity = id => id;

function map(visitors) {
  function mapper(input) {
    if (!Array.isArray(input)) {
      throw new Error(
        'Transform must be used on an Array. Received ' + JSON.stringify(input)
      );
    }
    const { path } = input[1];
    path.push(input[0].Type);
    const visitor = (() => {
      const [node] = input;
      if ('*' in visitors && typeof visitors['*'] === 'function') {
        return visitors['*'];
      }

      if (node.Type in visitors && typeof visitors[node.Type] === 'function') {
        return visitors[node.Type];
      }
      return identity;
    })();

    if (visitor.length === 2) {
      const result = visitor(input, mapper);
      path.pop();
      return result;
    }

    const [node, ...rest] = visitor(input);
    const params = node.params
      .filter(Boolean)
      .map(child => mapper([child, ...rest]));

    path.pop();
    return { ...node, params };
  }

  return mapper;
}

export { map };

export default function mapNode(visitor) {
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

    return {
      ...mappedNode,
      params,
    };
  };

  return nodeMapper;
}
