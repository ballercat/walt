# Walt Plugin Closures

This is a reference implementation of
[Closures](<https://en.wikipedia.org/wiki/Closure_(computer_programming)>)
plugin for the [Walt WebAssembly Compiler](https://github.com/ballercat/walt).

## Syntax

```js
type Func = () => i32;
// New GenericType "Lambda<Type>"
type Closure = Lambda<Func>;

// Closures require a table, because closure calls are indirect_call
const table: Table = { initial: 1, element: 'anyfunc' };

function getClosure(): Closure {
  const x: i32 = 0;
  // Closures can be defined with arrow function syntax
  return (): i32 => {
    x += 1;
    return x;
  };
}

export function run(): i32 {
  const closure: Closure = getClosure();
  closure();
  closure();
  return closure(); // 3
}
```

## Install

`npm install walt-plugin-syntax-closure`

## API

```js
import { compile } from 'walt-compiler';
import { plugin, imports } from 'walt-plugin-syntax-closure';

// .walt source with closures
const source = `...`;

// compiler options
const options = {
  extensions: [plugin],
};

// Closures require an additional import for support. It's provided by the plugin
Promise.resolve(imports(options, compile))
  .then(closureImports =>
    WebAssembly.instantiate(compile(source, options).buffer(), closureImports)
  )
  .then(mod => mod.instance.exports.run());
```

## CLI

N/A

## Reference

This plugin is meant to act as a reference example of plugins for the Walt
compiler. To demonstrate this it extends the grammar(syntax), the semantic
parser as well as provides a "side-module" import for it's run-time features.

### Grammar

The plugin adds an additional Node type `Closure` and makes it a valid
`Expression` type. For the full grammar see the
[Grammar File](./src/closures.ne).

### Semantic Parser

This plugin extends the semantic parser by parsing the new syntax down to the
supported AST format of the core compiler. See the main
[plugin source](./src/index.js) for how the semantic parser is extended.

### Imports

Ths plugin provides a run-time import for closure support. The following header
is added to every module using closures.

```js
// Start Closure Imports Header
import {
  __closure_malloc: ClosureGeti32,
  __closure_free: ClosureFree,
  __closure_get_i32: ClosureGeti32,
  __closure_get_f32: ClosureGetf32,
  __closure_get_i64: ClosureGeti64,
  __closure_get_f64: ClosureGetf64,
  __closure_set_i32: ClosureSeti32,
  __closure_set_f32: ClosureSetf32,
  __closure_set_i64: ClosureSeti64,
  __closure_set_f64: ClosureSetf64
} from 'walt-plugin-closure';
type ClosureFree = (i32) => void;
type ClosureGeti32 = (i32) => i32;
type ClosureGetf32 = (i32) => f32;
type ClosureGeti64 = (i32) => i64;
type ClosureGetf64 = (i32) => f64; type ClosureSeti32 = (i32, i32) => void;
type ClosureSetf32 = (i32, f32) => void;
type ClosureSeti64 = (i32, i64) => void;
type ClosureSetf64 = (i32, f64) => void;
// End Closure Imports Header
```

**Note**: There is no memory cleanup in the reference implementation of the
imports.

**Note**: You may provide your own import object under `walt-plugin-closure` as
long as it matches the API above. The buit-in import provided by plugin isn't
required.
