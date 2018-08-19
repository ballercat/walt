/**
 * Scope helpers.
 *
 * Normalizes how scope look ups are made
 */
const namespace = Symbol('scope namespace');

function enter(scopes, scopeName) {
  return [...scopes, { [namespace]: scopeName }];
}

function exit(scopes) {
  return scopes.slice(0, -1);
}

function current(scopes) {
  return scopes[scopes.length - 1];
}

function add(scopes, key, node) {
  const cur = current(scopes);
  if (cur && !cur[key]) {
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

module.exports = {
  enter,
  exit,
  add,
  find,
  current,
  namespace,
};
