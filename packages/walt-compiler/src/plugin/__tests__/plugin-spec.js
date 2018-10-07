import { makeFragment } from '../../parser/fragment';
import makeParser from '../../parser';
import test from 'ava';
import { map } from 'walt-parser-tools/map-node';
import { combineParsers } from '..';
import { compile } from '../..';

const fragment = makeFragment(makeParser([]));

test('plugin system', t => {
  const calls = [];
  // Should be able to call a method to get all plugins
  const plugin1 = () => {
    // Should return middleware
    return {
      // do something with options
      parser(_options) {
        // must return an object
        return {};
      },
      /* options here should be things like version number or plugin options */
      semantics(_options) {
        // must return an object
        return {
          Identifier: next => ([node]) => {
            calls.push('plugin1.semantics.Identifier');

            return next([node]);
          },
        };
      },
    };
  };

  const plugin2 = () => {
    return {
      semantics() {
        return {
          Identifier: next => ([node, context]) => {
            calls.push('plugin2.semantics.Identifier');

            return next([node, { ...context, extra: 'o' }]);
          },
          BinaryExpression: next => ([node, context = { foo: [] }]) => {
            calls.push('plugin2.semantics.BinaryExpression');
            context = { ...context, foo: [...context.foo, 'bar'] };

            return next([
              {
                ...node,
                type: 'f64',
              },
              context,
            ]);
          },
        };
      },
    };
  };

  const base = () => {
    return {
      semantics() {
        return {
          // The final stop for parsing, will parse the children/params of all nodes
          // which have at least one parser attached to them. This is necessary
          // because the map-node utility bails out (on parsing children) if the parsing function wants
          // to use the transform argument, which we always do.
          '*': next => ([node, context], transform) => {
            calls.push(`base.semantics.${node.Type}`);

            return next([
              {
                ...node,
                params: node.params.map(n => {
                  return transform([n, context]);
                }),
              },
              context,
            ]);
          },
        };
      },
    };
  };

  const plugins = [base, plugin1, plugin2];
  const parsers = combineParsers(plugins.map(p => p().semantics()));

  const ast = fragment('x + 2');

  const node = map(parsers)([ast]);

  t.deepEqual(
    calls,
    [
      'plugin2.semantics.BinaryExpression',
      'base.semantics.BinaryExpression',
      'plugin2.semantics.Identifier',
      'plugin1.semantics.Identifier',
      'base.semantics.Identifier',
    ],
    'Plugin precedence is preserved'
  );

  t.is(node.type, 'f64', 'Nodes are actually parsed');
});

test('plugin invariants', t => {
  const plugin = () => ({
    semantics: () => ({
      Identifier: _ => ([node], transform) => {
        // Transform MUST be called with an array [node, context]
        return transform(node);
      },
    }),
  });

  const ast = fragment('x + 2');
  const parsers = combineParsers([plugin].map(p => p().semantics()));

  t.throws(() => map(parsers)([ast]));
});

test('compiler extensions use', t => {
  const calls = [];
  const plugin = (...args) => {
    calls.push(['plugin', args]);
    return {
      semantics(..._args) {
        calls.push(['semantics', _args]);
        return {};
      },
      grammar(..._args) {
        calls.push(['grammar', _args]);
        return {
          ParserRules: {},
        };
      },
    };
  };
  const plugin2 = () => ({});

  compile('const x: i32 = 0;', { extensions: [plugin, plugin2] });

  t.snapshot(calls);
});
