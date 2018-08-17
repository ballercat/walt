import test from 'ava';
import { harness } from '../utils/test-utils';
import { join } from 'path';

const waltPath = join(__dirname, './string-spec.walt');

test('string', harness(waltPath));
