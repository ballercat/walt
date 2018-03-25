import OutputStream from "./output-stream";

export function* stringDecoder(view, start) {
  let length = 0;
  let index = start;
  let shift = 0;
  while (true) {
    const byte = view.getUint8(index, true);
    length |= (byte & 0x7f) << shift;
    index += 1;
    if ((byte & 0x80) === 0) {
      break;
    }
    shift += 7;
  }
  let end = index + length;

  let result = 0;
  while (index < end) {
    result = 0;
    shift = 0;
    while (true) {
      const byte = view.getUint8(index, true);
      result |= (byte & 0x7f) << shift;
      index += 1;
      if ((byte & 0x80) === 0) {
        break;
      }
      shift += 7;
    }
    yield result;
  }
}

export function stringEncoder(value) {
  const resultStream = new OutputStream();
  const characterStream = new OutputStream();

  characterStream.push("varuint32", value.length, value);
  let i = 0;
  for (i = 0; i < value.length; i++) {
    characterStream.push("varuint32", value.codePointAt(i), value[i]);
  }
  resultStream.write(characterStream);

  return resultStream;
}
