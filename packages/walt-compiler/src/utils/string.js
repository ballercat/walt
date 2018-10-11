import OutputStream from './output-stream';

export function* stringDecoder(view, start) {
  let length = 0;
  let index = 0;
  let shift = 0;
  let addr = start;
  while (true) {
    const byte = view.getUint8(addr, true);
    length |= (byte & 0x7f) << shift;
    addr += 1;
    if ((byte & 0x80) === 0) {
      break;
    }
    shift += 7;
  }

  let result = 0;
  while (index < length) {
    result = 0;
    shift = 0;
    while (true) {
      const byte = view.getUint8(addr, true);
      result |= (byte & 0x7f) << shift;
      addr += 1;
      if ((byte & 0x80) === 0) {
        break;
      }
      shift += 7;
    }
    index += 1;
    yield result;
  }
}

export function stringEncoder(value) {
  const resultStream = new OutputStream();
  const characterStream = new OutputStream();

  characterStream.push('varuint32', value.length, value);
  let i = 0;
  for (i = 0; i < value.length; i++) {
    characterStream.push('varuint32', value.codePointAt(i), value[i]);
  }
  resultStream.write(characterStream);

  return resultStream;
}

export const getText = memory => ptr => {
  let text = '';
  const decoder = stringDecoder(new DataView(memory.buffer), ptr);
  let iterator = decoder.next();
  while (!iterator.done) {
    text += String.fromCodePoint(iterator.value);
    iterator = decoder.next();
  }

  return text;
};
