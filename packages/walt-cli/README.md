# walt-cli

Line wrapper around the [Walt WebAssembly Compiler](https://github.com/ballercat/walt). Intended to be used to
build and package node modules utilizing WebAssembly/Walt. For browser integration
use the [webpack-loader](https://github.com/ballercat/walt/tree/master/packages/walt-loader).

## Install

```bash
npm install --save-dev walt-cli
```

In your `package.json`

```json
{
  "scripts": {
    "walt": "walt-cli"
  }
}
```

## Usage

### Compiling a single walt file to wasm

For one to one transforms point the cli at a single Walt file to get a single wasm
result file.

```bash
npm run walt -- index.walt -o index.wasm
```

### Compiling a walt program

For walt programs which has imports use the _wrap flag_ `-w`. Wrap option will
link and compile all dependencies starting from the entry file. The result is a
self contained JavaScript module which exports a factory function. Use it to
generate the WebAssembly instance of your walt program.

```bash
npm run walt -- src/walt/entry.walt -o walt-program.js -w
```

Once compiled the module can be imported just like any other JS module

```js
const makeProgram = require("./walt-program");
// Factory takes an imports object
makeProgram({
  env: {
    memory: new WebAssembly.Memory({ initial: 1 })
  }
}).then(result => {
  result.instance.exports.run();
});
```

**Note on imports**:

All walt imports starting with a relative path `./paht-to-something` is treated
as a walt module import. All absolute imports are left to you to provide and are
_shared between all modules_. Every module will get the same version of the import
object provided.
