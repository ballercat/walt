/**
 * Scope helpers.
 *
 * Normalizes how scope look ups are made
 */
const namespace = Symbol('scope namespace');
const signature = Symbol('signature');

function enter(scopes, scopeName) {
  return [
    ...scopes,
    { [namespace]: scopeName, [signature]: { result: null, arguments: null } },
  ];
}

function exit(scopes) {
  return scopes.slice(0, -1);
}

function current(scopes) {
  return scopes[scopes.length - 1];
}

function add(scopes, key, node) {
  const cur = current(scopes);
  if (cur) {
    cur[key] = node;
  }

  return cur;
}

function find(scopes, key) {
  const len = scopes.length;
  let i = len - 1;
  for (i; i >= 0; i--) {
    const ref = scopes[i][key];
    if (ref) {
      return ref;
    }
  }

  return null;
}

function index(scope, key) {
  const pos = Object.keys(scope).indexOf(key);
  return pos > -1 ? pos : Object.keys(scope).length;
}

module.exports = {
  enter,
  exit,
  add,
  find,
  current,
  index,
  namespace,
  signature,
};
