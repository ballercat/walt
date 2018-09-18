import compose from '../../utils/compose';

export const nth = n => d => d[n];
export const nuller = () => null;
export const nonEmpty = d => {
  return Array.isArray(d) ? !!d.length : d != null;
};
export const add = d => `${d[0]}${d[1]}`;

export const flatten = d =>
  d.reduce((acc, v) => {
    if (Array.isArray(v)) {
      return acc.concat(v);
    }

    return acc.concat(v);
  }, []);

export const drop = d => {
  return d.filter(nonEmpty);
};

export default {
  nth,
  nuller,
  nonEmpty,
  add,
  flatten,
  compose,
  drop,
};
