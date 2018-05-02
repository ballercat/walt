# walt-link

Linker for `walt` WebAssembly Programs.

## About

Wraps `.walt` file with a JavaScript module, with all the dependencies linked.

Intented to be used in a _node environment_. Not yet implemented in a loader.

**Still under development, but the API wont change.**

Notes

* Any import with a leading dot(`.`) will be linked into the final binary
* Anything without a leading dot(`.`) will be treated as an environment import
  and is left up to the user to implement.
* The top-level function returns a factory method which returns a function taking
  an import object. Every call to the method returns a brand new module
* _importObj_ used in the factory method is _shared accross all modules_.
* Walt Dependencies are shared within a single WebAssembly module instance. Each
  import is a stand alone module linked by the linker. This is useful if you want
  shared module state across imports, similar to node modules.

TODOs

-

## Usage

```js
const { link } = require("walt-link");
const path = require("path");

const factory = link(path.resolve(__dirname, "./index.walt"));

factory({
  env: {
    memory,
  },
}).then(wasmModule => {
  /* run your code here */
});
```
