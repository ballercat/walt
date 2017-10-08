const code = `import { setTimeout: Later } from 'env';
import { log: Log } from 'env';

type Log = (i32) => void;
type Later = (Function, i32) => void;

function echo(): void {
  log(42);
}

export function test(): void {
  setTimeout(echo, 5);
}
`;

const label = "Function Pointer (console)";

function compile(buffer) {
  const table = new WebAssembly.Table({ element: "anyfunc", initial: 10 });

  return WebAssembly.instantiate(buffer, {
    env: {
      table,
      log: function(value) {
        console.log("Timeout called with: " + value);
      },
      setTimeout: (functionPointer, timeout) => {
        const func = table.get(functionPointer);
        console.log("Getting function from Table", table);
        console.log(`function pointer id: ${functionPointer} == ${func}`);
        setTimeout(func, timeout);
      }
    }
  }).then(result => result.instance.exports.test());
}

const example = {
  code,
  label,
  compile,
  js: compile.toString()
};

export default example;
