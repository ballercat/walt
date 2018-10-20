import test from 'ava';
import makeParser from '../../parser';
import { makeFragment } from '../../parser/fragment';
import semantics from '../../semantics';
import validate from '..';

const parser = makeParser([]);
const fragment = makeFragment(parser);
const parseAndValidate = source =>
  validate(semantics(parser(source), [], { parser, fragment }), {
    lines: source.split('/n'),
    filename: 'spec.walt',
    extraSemantics: [],
  });

test('ast must have metadata attached', t => {
  const error = t.throws(() => validate({ meta: [] }, { filename: 'test' }));
  t.snapshot(error);
});

test('typos throw', t => {
  const error = t.throws(() => parseAndValidate('expost const x: i32;'));
  t.snapshot(error, true);
});
test('global exports must have value', t => {
  const error = t.throws(() => parseAndValidate('export const x: i32;'));
  t.snapshot(error);
});

test('undefined types throw', t => {
  // Memory and Tables are fine
  parseAndValidate("import { memory: Memory, table: Table } from 'env';");
  const error = t.throws(() =>
    parseAndValidate("import { foo: Type } from 'env';")
  );
  t.snapshot(error);
});

test('const cannot be re-asigned', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    function test() {
      const x: i32 = 0;
      x = 1;
      const y: i32 = 0;
      y += 1;
    }`)
  );
  t.snapshot(error);
});

test('unterminated declaration statements', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    function test() {
      const x: i32 = 0
      x = 2;
    }`)
  );
  t.snapshot(error);
});

test('unterminated assignment statements', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    function test() {
      let x: i32 = 0;
      let y: i32 = 0;
      x = 2
      y = 3 + 3;
    }`)
  );
  t.snapshot(error);
});

test('undefined object properties', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    type T = { x: i32 };
    function test() {
      const obj: T = 0;
      obj = { y: 5 };
      obj.y = 5;
    }`)
  );
  t.snapshot(error);
});

test('access on undefined objects', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    function test() {
      obj.y = 5;
    }`)
  );
  t.snapshot(error);
});

test('functions must have consistent returns', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    function i32void(): i32 {
      return;
    }
    function i32i64(): i32 {
      const x: i64 = 0;
      return x;
    }
      `)
  );
  t.snapshot(error);
});

test('functions must be defined', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    function test(): i32 {
      const ptr: Type = 0;
      ptr();
      return notDefined();
    }
      `)
  );
  t.snapshot(error);
});

test('constants must be initialized', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    const g: i32 = 2 + 2;
    function test() {
      const x: i32;
    }
      `)
  );
  t.snapshot(error);
});

test('untyped imports need to be compiled out via a linker/build step', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    import {
      foo
    } from './foo';
    `)
  );
  t.snapshot(error);
});

test('unknown user types at global scope, error', t => {
  const error = t.throws(() =>
    parseAndValidate(`
    let t: unknown = 0;
    function foo() {
      let k: unknown = 0;
    }
    `)
  );
  t.snapshot(error);
});

test('invalid sucbscript target', t => {
  const error = t.throws(() =>
    parseAndValidate(`
const memory: Memory = {initial: 1};
const table: Table = { initial: 10, element: 'anyfunc' };

type ResultFnType = (i32) => void;

export function fn(a: i32, l: i32, f: ResultFnType): i32 {
	let v: i32 = 0;
	let i: i32 = 0;
	for(i; i < l; i+=1)
		v += a[i];
	f(v);
}`)
  );
  t.snapshot(error);
});
