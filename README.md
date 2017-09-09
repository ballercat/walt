[![Build Status](https://travis-ci.org/ballercat/walt.svg?branch=master)](https://travis-ci.org/ballercat/walt)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ballercat/walt/issues)
[![Coverage Status](https://coveralls.io/repos/github/ballercat/walt/badge.svg?branch=master)](https://coveralls.io/github/ballercat/walt?branch=master)

# WAlt
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

Here is what an example of a `.walt` module which exports a recursive fibonacci function looks like:

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
  * [ ] Compile warnings/errors - partial support
  * [ ] Branches - if/then/else, switch, loops (WIP)
  * [ ] Function imports
  * [ ] Memory
  * [ ] Custom _Object_ Types
* Emiter - WIP
  * [x] ~Exports~
  * [x] ~Functions~
  * [ ] Types - partial support(opaque function types), wasm built-ins(only i32/f32 for now)
  * [ ] Branches
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
* `memory` - reserved for :unicorn: future memory declarations and operations

All s-expression-syntax words are reserved and can be written directly into `.walt` scripts.

## Syntax

Initial gramar definition is provided in the `/docs/gramar.md`

### Statements and Expressions

WAlt splits its syntax into statements and expressions(like JavaScript).

### Comments

WAlt will support C99 style comments `//` and `/* */` blocks. _Not yet implemented_

### Functions

Everything in WAlt as in WebAssembly must have a Type. Function are no exception to the rule. When a function is declared it's type is hoisted by the compiler behind the scenes. A function type is a list of parameters and a result type.

:unicorn: Currently a custom functon type syntax is not implemented, but is required in order to use custom-function imports.
```javascript
import { log: Log } from 'console';
type Log = (i32) => void
```
:unicorn: **Arror Functions**. _Might be implemented._

### Module

Every WAlt file is compiled into a stand alone module. `module` is a reserved keyword

### Improting WAlt from JavaScript

With an implemented loader it will be possible to pipe the output to `wasm-loader` allowing for code like this:

```javascript
import makeCounter from './counter'; // <-- a .walt file

makeCounter() // returns a Promise
  .then(result => {
    console.log(result.exports.counter()); // 0, 1, 2, 3 etc.,
  });
```


