import test from 'ava';
import makeParser from '../parser';
import { makeFragment } from '../parser/fragment';
import validate from '../validation';
import semantics from '../semantics';
import { compile } from '..';
import print from 'walt-buildtools/print';
import path from 'path';
import { harness, compileAndRun } from '../utils/test-utils';

test('empty module compilation', t =>
  compileAndRun('').then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test('invalid imports throw', t =>
  t.throws(() => compile("import foo from 'bar'")));

test(
  'compiler',
  harness(path.resolve(__dirname, './compiler-spec.walt'), {
    externalConst: 42,
  })
);

test(
  'statics',
  harness(path.resolve(__dirname, './statics-spec.walt'), null, {
    printBinary: false,
    printNode: false,
  })
);

test('chained subscripts', t => {
  return harness(path.resolve(__dirname, './subscripts-spec.walt'), null, {
    printBinary: false,
    printNode: false,
  })(t);
});

test('throws', t => {
  const run = harness(path.resolve(__dirname, './throw-spec.walt'), null, {
    printBinary: false,
    printNode: false,
  });

  return run(t).catch(error => {
    t.snapshot(error);
  });
});

test('import as', t => {
  const parser = makeParser([]);
  const fragment = makeFragment(parser);

  const node = semantics(
    parser(`
import {
  getStringIterator,
  next as string_next,
  reset,
  stringLength,
  indexOf
} from '../walt/string';
`),
    [],
    { parser, fragment }
  );
  const error = t.throws(() => validate(node, {}));
  t.snapshot(print(node));
  t.snapshot(error.message);
});

test('bool types', t => {
  const source = `
    const b : bool = false;
    function foo() : bool {
      return true;
    }

    function bar(): bool {
      return false;
    }

    export function test() : bool {
      return bar() || foo();
    }
  `;

  return compileAndRun(source).then(({ instance }) => {
    t.is(instance.exports.test(), 1);
  });
});

test('memory & table exports', t => {
  const source = `
    export const memory: Memory = { initial: 1 };
    export const table: Table = { initial: 1, element: 'anyfunc' };
  `;
  return compileAndRun(source).then(({ instance }) => {
    t.is(instance.exports.memory instanceof WebAssembly.Memory, true);
    t.is(instance.exports.table instanceof WebAssembly.Table, true);
  });
});

test('tee-local', t => {
  const source = `
  export function run(iterations: i32) : i32 {
    iterations += 1;
    let counter : i32 = 0;
    while (iterations -= 1) {
      counter += 1;
    }
    return counter;
  }`;
  return compileAndRun(source).then(({ instance }) => {
    t.is(instance.exports.run(10), 10);
  });
});

test('ternary', t => {
  const source = `
    function getY() : i32 {
      return 10;
    }
    function getZ() : i32 {
      return -10;
    }
    export function run(x : i32) : i32 {
      // FIXME: using a ternary inside a return currently fails validation,
      //        looks like the type info is lost (result of the select)
      const result : i32 = x ? getY() : getZ();
      return result;
    }
  `;
  return compileAndRun(source, {}, { debug: false }).then(({ instance }) => {
    t.is(instance.exports.run(1), 10);
    t.is(instance.exports.run(0), -10);
  });
});

test('struct types in binary expr with nulls', () => {
  const source = `
  const memory : Memory = { initial: 1 };
  type Node = {
    data: i32,
    left: Node,
    right: Node
  };
  export function run() {
    let node : Node = 0;

    if (node.left != null) {
      node = node.left;
    } else if (node.left != null) {
      node = node.right;
    }
  }
  `;

  return compileAndRun(source, {}, { debug: false });
});
