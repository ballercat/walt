import test from 'ava';
import { harness } from '../utils/test-utils';
import { join } from 'path';

test('native opcodes', harness(join(__dirname, './native-opcode-spec.walt')));
