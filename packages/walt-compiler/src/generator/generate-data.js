// @flow
import { stringEncoder } from "../utils/string";
import OutputStream from "../utils/output-stream";

export default function generateData(
  statics: any,
  DATA_SECTION_HEADER_SIZE: number
) {
  // Reserve N bytes for data size header
  let offsetAccumulator = DATA_SECTION_HEADER_SIZE;

  const map: { [string]: number } = {};
  const data = Object.keys(statics).reduce((acc, key) => {
    const encoded = stringEncoder(key);
    acc.push({ offset: Number(offsetAccumulator), data: encoded });
    map[key] = offsetAccumulator;
    offsetAccumulator += encoded.size;
    return acc;
  }, []);

  // reserved stream for the size header
  const lengthStream = new OutputStream();
  lengthStream.push("varuint32", offsetAccumulator, String(offsetAccumulator));

  return {
    data: [{ offset: 0, data: lengthStream }, ...data],
    map,
  };
}
