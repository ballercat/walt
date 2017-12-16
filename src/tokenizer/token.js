// @flow
const wrap = (predicate: Function, type: string, supported?: Array<string>) => {
  const wrapper = (value: string) => {
    const result = predicate(value);
    return typeof result === 'function' ? wrap(result, type, supported) : result;
  };
  wrapper.type = type;
  wrapper.supported = supported;
  wrapper.strict = !!supported;
  wrapper.leaf = predicate.leaf;
  return wrapper;
};

module.exports = wrap;

