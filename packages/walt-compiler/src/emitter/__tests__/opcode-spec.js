import test from 'ava';
import opcode, { opcodeMap, textMap } from '../opcode';

test('opcode is a list of opcodes', t => t.is(typeof opcode, 'object'));

test('sanity check resulting ojects', t => {
  const keys = Object.keys(opcode);
  keys.forEach(key => {
    const code = opcode[key];
    t.is(key, code.name, `Name is set for ${key}`);
    t.is(opcodeMap[code.code], code, `Opcode map is set for ${key}`);
    t.is(textMap[code.text], code, `Text map is set for ${key}`);
  });
});
