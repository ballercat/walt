import { sizeof } from "wasm-types";

const _debug = (stream, begin = 0, end) => {
  let pc = 0;
  return (
    stream.data
      .slice(begin, end)
      .map(({ type, value, debug }) => {
        const pcString = pc
          .toString(16)
          .padStart(8, "0")
          .padEnd(stream.data.length.toString().length + 1);
        let valueString;
        if (Array.isArray(value))
          valueString = value
            .map(v => v.toString(16))
            .join()
            .padStart(12);
        else valueString = value.toString(16).padStart(12);
        const out = `${pcString}: ${valueString} ; ${debug}`;
        pc += sizeof[type] || value.length;
        return out;
      })
      .join("\n") + "\n ============ fin ============="
  );
};

export default _debug;
