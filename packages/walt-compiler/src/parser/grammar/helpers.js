const compose = require('../../utils/compose').default;

const nth = n => d => d[n];
const nuller = () => null;
const nonEmpty = d => {
  return Array.isArray(d) ? !!d.length : d != null;
};
const add = d => `${d[0]}${d[1]}`;

const flatten = d =>
  d.reduce((acc, v) => {
    if (Array.isArray(v)) {
      return acc.concat(v);
    }

    return acc.concat(v);
  }, []);

const drop = (d = []) => {
  return d.filter(nonEmpty);
};

module.exports = {
  nth,
  nuller,
  nonEmpty,
  add,
  flatten,
  compose,
  drop,
};
