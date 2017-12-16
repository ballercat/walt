[![Build Status](https://travis-ci.org/ballercat/walt.svg?branch=master)](https://travis-ci.org/ballercat/walt)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ballercat/walt/issues)
[![Coverage Status](https://coveralls.io/repos/github/ballercat/walt/badge.svg?branch=master)](https://coveralls.io/github/ballercat/walt?branch=master)

<p align="center">
  <img src="walt.png" width="117" height="74"><br><br>
  <b>Walt</b> |
  <i>Alternative Syntax for WebAssembly</i> |
  <a href="https://ballercat.github.io/walt/">Demo</a>
</p>

:zap: **WAlt** is an alternative syntax for WebAssembly text format. It's an experiment for using JavaScript syntax to write to as 'close to the metal' as possible. _It's JavaScript with rules._ `.walt` files compile directly to WebAssembly binary format.

Highlights:

* Write _"close to the metal"_ JavaScript!
* **No C/C++ or Rust required**, just _typed_ JavaScript.
* **NO LLVM/binary toolkits required**, zero dependencies 100% written in JS.
* Fast compilation, integrates into webpack!

:construction: **currently under heavy construction** :construction:

:rocket: Try it out in the [Walt Explorer](https://ballercat.github.io/walt/).

:pray: Contributions are welcomed! [Contributing guide](https://github.com/ballercat/walt/blob/master/CONTRIBUTING.md).

:partly_sunny: Current status: **pre-alpha**

# Problem
Writing zero-overhead, optimized WebAssembly is pretty tough to do. The syntax for `.wat` files is terse and difficult to work with directly. If you do not wish to use a systems language like C or Rust,
then you're kind of out of luck. Your best bet (currently) is to write very plain C code, compile that to .wast and then optimize that result. Then you're ready to compile that into the final WebAssembly binary. This is an
attempt to take C/Rust out of the equation and write 'as close to the metal' as possible without loosing readability.

I feel like this is currently a problem. Most Web engineers are not familiar with the C family languages or Rust. It's a barrier for wide spread adoption of WebAssembly. A competent Front-end engineer
should be able to edit WebAssembly as easily as any other systems programmer.

# Solution
Provide a **thin layer** of syntax sugar on top of `.wat` text format. Preferably porting as much of JavaScript syntax to WebAssembly as possible. This improved syntax should give direct control over
the WebAssembly output. Meaning there should be minimal to none post optimization to be done to the wast code generated. The re-use of JavaScript semantics is intentional as I do not wish to create a brand new language.

Here is what an example of a `.walt` module which exports a recursive Fibonacci function looks like:

```js
export function fibonacci(n: i32): i32 {
  if (n == 0)
    return 0;

  if (n == 1)
    return 1;

  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

When this code is ran through the walt compiler you end up with a buffer which can be used to create a WebAssembly module with a `fibonacci` export just as you would expect. All done with familiar JS syntax and without any external binary toolkits! A working demo of this exists in the `fibonacci-spec.js` [unit test file](https://github.com/ballercat/walt/blob/master/src/__tests__/fibonacci-spec.js).

# Goals
1. Subset of JavaScript(with flow-types if possible)
2. Types (flow syntax)
3. Simplify exports and imports
4. Fast compilation
5. Compile from `.walt` to `.wasm` directly
6. Webpack loader to convert `.walt` files to importable JavaScript modules
7. Test Suite
8. Flexible parser to allow quick prototyping and new syntax options :octocat:

# Notes
* WebAssembly spec https://github.com/WebAssembly/wabt
* WebAssembly Text format semantics. https://github.com/WebAssembly/design/blob/master/Semantics.md
* WebAssembly semantics test suite https://github.com/WebAssembly/spec/tree/master/test/core
* WebAssembly Binary Toolkit https://github.com/WebAssembly/wabt.
* S-syntax https://github.com/WebAssembly/spec/tree/master/interpreter#s-expression-syntax
* WAS Syntax experiment from Mozilla https://github.com/mbebenita/was

# Prior Art
* [wah](https://github.com/tmcw/wah) - A slightly higher level syntax on top of the wasm text format

# RoadMap
* Spec
  - [x] ~A basic Grammar~
  - [ ] Examples - WIP, [Explorer](https://ballercat.github.io/walt/)
* [x] ~Tokenizer~
* Parser - WIP
  * [x] ~Exports: functions, constant globals~
  * [x] ~Declarations~
  * [x] ~BinaryExpressions~
  * [x] ~Local Scope & Global Scope~
  * [x] ~Compile time warnings and errors~
  * [x] ~while loops~
  * [x] ~for loops~
  * [ ] switch/case
  * [x] Function imports
  * [x] Function pointers
  * [x] Arrays
  * [x] Memory
  * [x] Custom _Object_ Types
* Emitter - WIP
  * [x] ~Exports~
  * [x] ~Functions~
  * [x] ~Types - wasm built ins(i32/f32)~
  * [x] ~Types - custom function type imports~
  * [x] Memory
  * [x] ~Arithmetic~
  * [x] ~Globals, Locals~
* [ ] Support 100% of native Wasm functions
* [ ] Webpack Loader
* IDE integration
  * [ ] linter
  * [ ] VIM colors, syntax

# Spec (WIP)

### Reserved Keywords

Initial release of WAlt has very few keywords.

* `let`, `const`, `type` - Declarations
* `import`, `export` - Imports and exports
* `function`, `return` - Functions and return statements
* `i32`, `i64`, `f32`, `f64` - Built in types
* `void` - is a custom label used to indicate functions which return nothing (because it's easy to parse). It's compiled out of the final binary.
* `module` - reserved for :unicorn: future features
* `memory`, 'Memory' - reserved for :unicorn: future memory declarations and operations

All s-expression-syntax words are reserved and can be written directly into `.walt` scripts.

## Syntax

Initial grammar definition is provided in the `/docs/grammar.md`

### Statements and Expressions

WAlt splits its syntax into statements and expressions (like JavaScript).

### Comments

WAlt will support C99 style comments. Inline comments are supported currently ('//') but not comment blocks
(`/* */`).

### Functions

Everything in WAlt as in WebAssembly must have a Type. Function are no exception to the rule. When a function is declared it's type is hoisted by the compiler behind the scenes. A function type is a list of parameters and a result type.

:unicorn: Currently a custom function type syntax is not implemented, but is required in order to use custom-function imports.
```javascript
import { log: Log } from 'console';
type Log = (i32) => void
```
:unicorn: **Arrow Functions**. _Might be implemented._

### Function imports and pointers

It is possible to import custom functions and use wasm functions as callbacks.

```javascript
import { log: Log } from 'env';
import { setTimeout: Later } from 'env';

type Log = (i32) => void;
type Later = (Function, i32) => void;

function echo(): void {
  log(42);
}

export function echoLater(x: i32): void {
  setTimeout(echo, 200);
}
```

* Compiling the above example will require a `WebAssembly.Table` import to be provided in the imports object.

Keep in mind that the `Function` parameter is encoded into a `i32` table index. This means that the `setTimeout` function
must be a wrapper which can get the _real_ wasm function pointer from table object. Like so:

```javascript
{
  setTimeout: (tableIndex, timeout) => {
    const pointer = tableInstance.get(tableIndex);
    setTimeout(pointer, timeout);
  }
}
```

### Arrays, Object, Memory

Simple rules about objects and arrays.

* Both arrays and objects are stored in the heap, NOT on the stack
* WAlt has no built in memory functions like `new` or `delete`
* There is no _special_ syntax for pointers, regular 32-bit address integers are used
* Every object and array must be initialized with an address.
* Every custom object must have a corresponding type definition
* Object Type definitions are _not_ present in any way in the final binary output. They are used as compiler hints.
* `type` keyword is used to create a new user-type. Types can be object or function types.
* Dynamic keys are not allow/will not work.
* _Except_ for arrays, which currently have no out-of-bounds checks.
* Arrays of custom types are _not yet_ supported
* WAlt **does not implicitly import Memory**, memory must be manually imported OR declared before any memory operations can be used.

Mainly these makes it easier to write a compiler for WAlt. Interop between JavaScript and WAlt becomes
simpler as well and the "syntax sugar" is kept to a minimum on top of the existing WebAssembly functionality.

Before using arrays or objects memory must be declared
```javascript
const memory: Memory = { 'initial': 0 };
```

Array example:

```javascript
// Unlike objects arrays do not require custom types and can be declared in-place
const intArr: i32[] = 0;

// There are no static array sizes and they can be read/written to at any index
intArr[0] = 2;
// Keep in mind that out-of-bounds memory access will result in a runtime error
intArr[255] = 10;
```

Object example:

```javascript
// Object types are js-like objects with key value pairs of object properties
// and corresponding built-in basic types (i32, f32, i64, f64)
type FooType = { 'foo': i32 };

// Objects must be initialized with an address
// NOTE: WAlt runtime will _not_ perform any safety checks on this address
const foo: FooType = 0;

// Property lookups are performed as string subscripts
foo['foo'] = 200;

// Because objects are compiled down to a single integer address, they can be freely
// passed around to other functions or put into other objects
someOtherFunction(foo); // (i32) => void
```

### Module

Every WAlt file is compiled into a stand alone module. `module` is a reserved keyword

### Importing WAlt from JavaScript

With an implemented loader it will be possible to pipe the output to `wasm-loader` allowing for code like this:

```javascript
import makeCounter from './counter'; // <-- a .walt file

makeCounter() // returns a Promise
  .then(result => {
    console.log(result.exports.counter()); // 0, 1, 2, 3 etc.,
  });
```


