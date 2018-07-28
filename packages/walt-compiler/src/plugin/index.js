import compose_ from "../utils/compose";

const combineMiddleware = transforms => {
  let transform;

  const chain = transforms.reduce((stack, go) => {
    return go(node => {
      return stack(node, transform);
    });
  }, identity => identity);

  return (node, topLevelTranfrom) => {
    transform = topLevelTranfrom;
    return chain(node, transform);
  };
};

const addWildcard = (parsers, wildcard) => {
  Object.entries(parsers).forEach(([key, current]) => {
    parsers[key] = [...current, wildcard];
  });
};

export const combineParsers = (sortedParsers = []) => {
  const wildcards = [];

  // Normalize parsers by type
  const parsersByType = sortedParsers.reduce((acc, parser) => {
    Object.entries(parser).forEach(([type, cb]) => {
      // Wildcards may only handle types which have other callbacks attached to
      // them.
      if (type === "*") {
        wildcards.push(cb);
        // We need to add a wildcard to any already existing parser
        addWildcard(acc, cb);
        return;
      }

      if (acc[type] == null) {
        // Prepend any previously defined wildcard to maintain precedence
        acc[type] = [...wildcards];
      }

      acc[type].push(cb);
    });

    return acc;
  }, {});

  return Object.entries(parsersByType).reduce((acc, [key, transforms]) => {
    acc[key] = combineMiddleware(transforms);

    return acc;
  }, {});
};

export default function plugin() {}
