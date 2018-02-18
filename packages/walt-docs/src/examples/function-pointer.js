import code from "./walt/function-pointer";

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
        window.setTimeout(func, timeout);
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
