import { u32, get } from 'wasm-types';
import preamble, {
  MAGIC,
  VERSION,
  MAGIC_INDEX,
  VERSION_INDEX
} from '../preamble';

test('preamble writes correct values', () => {
  const view = new DataView(preamble().buffer());
  expect(get(u32, MAGIC_INDEX, view)).toBe(MAGIC);
  expect(get(u32, VERSION_INDEX, view)).toBe(VERSION);
});
