import test from 'ava';
import { enter, exit, add, find, namespace, current } from '../scope';

test('scope', t => {
  const SCOPE_NAMESPACE = 'local';
  let scopes = enter([], SCOPE_NAMESPACE);

  // When a scope is added it's unique namespace can be looked up
  t.is(current(scopes)[namespace], SCOPE_NAMESPACE);

  scopes = exit(scopes);

  t.is(current(scopes) == null, true);

  scopes = enter(scopes, SCOPE_NAMESPACE);

  const node = {
    value: 'x',
    type: 'i32',
    meta: { scope: current(scopes)[namespace] },
  };
  add(scopes, 'x', node);

  scopes = enter(scopes, 'nested');
  add(scopes, 'x', Object.assign({}, node));
  scopes = enter(scopes, 'another');

  // The first in the scope chain is always returned
  let ref = find(scopes, 'x');
  t.not(ref, node);

  scopes = exit(scopes);
  scopes = exit(scopes);

  ref = find(scopes, 'x');
  t.is(ref, node);
});
