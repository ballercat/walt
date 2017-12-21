import compile from '..';
import statement from '../parser/statement';
import { TYPE_ARRAY } from '../parser/metadata';
import { mockContext } from '../utils/mocks';

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);

const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('memory can be defined', async () => {
  const result = await compileAndRun(`
    const memory: Memory = { 'initial': 2 };

    export function test(): i32 {
      let x: i32[] = 0;
      let y: i32 = 5;
      x[0] = 21;
      x[y] = 2;
      return x[0] * x[y];
    }`);
  outputIs(result, 42);
});

test('memory store on float arrays', () => {
  const ctx = mockContext('x[0] = 2.0;');
  ctx.func = {
    locals: [
      { id: 'x', type: 'i32', meta: [{ type: TYPE_ARRAY, payload: 'f32' }] }
    ]
  };
  const node = statement(ctx);
  expect(node).toMatchSnapshot();
});
