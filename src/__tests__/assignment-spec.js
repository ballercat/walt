import compile from '..';
import { mockContext } from '../utils/mocks';
import parseStatement from '../parser/statement';

const compileAndRun = src => WebAssembly.instantiate(compile(src));

const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('declration assignment', async () => {
  const out = await compileAndRun(
    'export function test(): i32 { let x: i32 = 2; return x; }'
  );
  outputIs(out, 2);
});

test('assigment statement', async () => {
  const out = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 2;
    x = y + 2;
    return x;
  }`);
  outputIs(out, 4);
});

test('unary negation', () => {
  const ctx = mockContext('x = -3;');
  ctx.func = { locals: [{ id: 'x', type: 'i32', meta: [] }] };
  const node = parseStatement(ctx);
  expect(node).toMatchSnapshot();
});
