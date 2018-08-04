import mapSyntax from '../map-syntax';
import test from 'ava';

test('map syntax throws if Type is unknown', t => {
  t.throws(() => {
    mapSyntax({}, { value: 'unknown', Type: null });
  });
});
