# Walt Compiler

This is the main walt compiler package.

### Install

`npm install --save walt-compiler`

### API

```flow
type Compile = (source: string, options?: Options) => Result
```

Compile and run Walt code in browser:

```js
import { compile } from 'walt-compiler';

const buffer = compile(`
  let counter: i32 = 0;
  export function count(): i32 {
    counter += 1;
    return counter;
  }
`).buffer();

WebAssembly.instantiate(buffer).then(result => {
  console.log(`First invocation: ${result.instance.exports.count()}`);
  console.log(`Second invocation: ${result.instance.exports.count()}`);
});
```

Compile and save a `.wasm` file via Node.js:

```js
const { compile } = require('walt-compiler');
const fs = require('fs');

const buffer = compile(`
  let counter: i32 = 0;
  export function count(): i32 {
    counter += 1;
    return counter;
  }
`).buffer();

fs.writeFileSync('bin.wasm', new Uint8Array(buffer));
```

### Result

```flow
type Result = {
  buffer: () => ArrayBuffer,
  ast: NodeType,
  semanticAST: NodeType
}
```

#### buffer()

Unique (across function calls) `ArrayBuffer` instance.

#### ast

The `Program` root node containing the source program without any type information. This is the node passed to semantic parser.

#### semanticAST

The `Program` root node containing the source program including the final type information. This is the AST version used to generate the final binary.

### Options

```flow
type Options = {
  version?: number,
  encodeNames?: boolean,
  filename?: string,
  extensions: Array<Plugin>
}
```

#### version

The target WebAssembly Standard (not to be confused with compiler version) version to which the source should be compiled to. Currently supported versions: `0x01`

#### encodeNames

Whether or not names section should be encoded into the binary output.
 This enables a certain level of extra debug output in supported browser DevTools.
 Increases the size of the final binary. Default: `false`

#### filename

Filename of the compiled source code. Used in error outputs. Default: `unknown.walt`

#### extensions

An array of functions which are compiler extensions. See the `Plugin` section for plugin
 details. Default: `[]`

 **note**: Plugins are applied from right to left with the core language features applied _last_.

### Plugin

The compiler may be extended via extensions or plugins. 
Each plugin must be a function return an object with the following keys: `semantics`, `grammar`. Where each value is a function.

```flow
type Plugin = (Options) => {
  semantics: ({ parser: Function, fragment: Function }) => {
    [string]: next => ([node: NodeType, context]) => NodeType
  },
  grammar: Function
}
```

Each plugin is capable of editing the following features of the compiler:

* `grammar` - The syntax or grammar which is considered valid by the compiler. This enables features like new keywords for example.
* `semantics` - The parsing of the `ast`. Each key in the object returned by this method is expected to be a middleware like parser function which may edit the node passed into it. 

For an example of how plugins work see the full list of [core language feature plugins](./src/core/).
