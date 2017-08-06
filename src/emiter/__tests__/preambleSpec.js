import test from 'ava';
import { u32 } from 'wasm-types';
import preamble, {
  MAGIC,
  VERSION,
  MAGIC_INDEX,
  VERSION_INDEX
} from '../preamble';
import OutputStream from '../../utils/output-stream';

test('preamble writes correct values', t => {
  const stream = new OutputStream();
  preamble(stream);
  t.is(stream.get(u32, MAGIC_INDEX), MAGIC);
  t.is(stream.get(u32, VERSION_INDEX), VERSION);
});
