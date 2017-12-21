import declaration from '../parser/declaration';
import { mockContext } from '../utils/mocks.js';

test('array declaration', () => {
  const ctx = mockContext('let x: i32[] = 0;');
  ctx.func = { locals: [] };
  const node = declaration(ctx);
  expect(node).toMatchSnapshot();
});
