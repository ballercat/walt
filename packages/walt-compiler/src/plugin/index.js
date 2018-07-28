import compose_ from "../utils/compose";

export const compose = plugins => {
  const parsers = plugins.reduce((acc, plugin) => {
    Object.entries(plugin).forEach(([key, parser]) => {
      if (acc[key] == null) {
        acc[key] = [];
      }

      acc[key].push(parser);
    });

    return acc;
  }, {});
  debugger;
  return Object.entries(parsers).reduce((acc, [key, transforms]) => {
    const chain = compose_(...transforms)(id => id);
    acc[key] = chain;

    return acc;
  }, {});
};

export default function plugin() {}
