# Walt Compiler
This is the main walt compiler package.

### Install

`npm install --save walt-compiler`

### API

```js
import compileWalt from 'walt-compiler';
//const compileWalt = require('walt-compiler').default; // in case of Node.js

const buffer = compileWalt(`
  let counter: i32 = 0;
  export function count(): i32 {
    counter += 1;
    return counter;
  }
`);

//require('fs').writeFileSync('bin.wasm', new Uint8Array(buffer)); // to save the binary file

WebAssembly.instantiate(buffer).then(result => {
  console.log(`First invocation: ${result.instance.exports.count()}`);
  console.log(`Second invocation: ${result.instance.exports.count()}`);
});
```

#### parse

Main parse step of the compiler. Returns a bare bones Abstract Syntax Tree without
type information. This tree cannot be directly compiled without semantic analysis, but
can be transformed easily.

```js
import { parser } from 'walt-compiler';

const ast = parser(`
  type MyObjectType = { 'foo': i32, 'bar': f32 };
  export function test(): f32 {
    const obj: MyObjectType = 0;
    obj['foo'] = 2;
    obj['bar'] = 2.0;
    return obj['foo'] + obj['bar'];
  }
`);

console.log(ast); // { value: 'ROOT_NODE', Type: 'Program', range: [...], params: [...] .... }
```

#### prettyPrintNode

Provides a human readable output of the AST nodes. Returns a string, does not log to console.

#### semantics

Semantic Analyzer, takes a bare AST and returns a transformed version of the AST with semantics
applied(type indexes etc.,).

#### generator

Intermediate code generator, takes an AST and returns a Program object.

#### emitter

Binary emitter, takes a Program and returns an OutputStream object. `OutputStream.buffer()`
generates a "real" binary buffer.

#### debug

Used for debugging the buffer returned by emitter. Returns a string representation of the binary program.

