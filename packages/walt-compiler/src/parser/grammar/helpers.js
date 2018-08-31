const nth = n => d => d[n];
const nuller = () => null;
const nonEmpty = d => {
  return Array.isArray(d) ? !!d.length : d != null;
};
const add = d => `${d[0]}${d[1]}`;

module.exports = {
  nth,
  nuller,
  nonEmpty,
  add,
};
