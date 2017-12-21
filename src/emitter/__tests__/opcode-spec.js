import opcode, { opcodeMap, textMap } from '../opcode';

test('opcode is a list of opcodes', () => expect(typeof opcode).toBe('object'));

test('sanity check resulting ojects', () => {
  const keys = Object.keys(opcode);
  keys.forEach((key) => {
    const code = opcode[key];
    expect(key).toBe(code.name);
    expect(opcodeMap[code.code]).toBe(code);
    expect(textMap[code.text]).toBe(code);
  });
});


