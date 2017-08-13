[![Build Status](https://travis-ci.org/ballercat/walt.svg?branch=master)](https://travis-ci.org/ballercat/walt)

# Walt
:zap: **Walt** is syntax sugar for WebAssembly text format. It's an experiment for using JavaScript syntax to write to as 'close to the metal' as possible. A sort-of C for the web. I wouldn't say it's
compiled into `.wast` as much as it's a better way of writing wast code directly.

# Problem
Writing zero-overhead, optimized WebAssembly is pretty tough to do. The syntax for .wast files is terse and difficult to work with directly. If you do not wish to use a systems language like C or Rust,
then you're kind of out of luck. Your best bet (currently) is to write very plain C code, compile that to .wast and then optimize that result. Then you're ready to compile that into the final .wasm. This is an
attempt to take C out of the equation and write 'as close to the metal' as possible without loosing readability.

I feel like this is currently a problem. Most Web engineers are not familiar with the C family languages or Rust. It's a barrier for wide spread adoption of WebAssembly. A competent Front-end engineer
should be able to edit WebAssembly as easily as any other systems programmer.

# Solution
Provide a **thin layer** of syntax sugar on top of `.wast` text format. Preferably porting as much of JavaScript syntax to WebAssembly as possible. This improved syntax should give direct control over
the WebAssembly output. Meaning there should be minimal to none post optimization to be done to the wast code generated. The re-use of JavaScript semantics is intentional as I do not wish to create a
new language.

# Goals
1. Subset of ES6 syntax
2. Type annotations (similar to flow).
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
* Tokenizer
* Parser
* Emiter
* Webpack Loader
* IDE integration
* linter
* VIM colors, syntax

# Spec (WIP)

### Reserved Keywords

* Keywords from JavaScript (WIP):
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar
```javascript
break       else          new
case        export        return
catch       extends       super
class       finally       switch
const       for           this
continue    function      throw
debugger    if            try
default     import        typeof
delete      in            var
do          instanceof    void
with        yield         while
```

All s-expression-syntax words are reserved and can be written directly into `.walt` scripts.

## Alternative Syntax

### Expressions

Each expression must end in a `;`

### Comments

* `.walt`
```javascript
// single line comment
/**
  multi
  line
  comment
**/
```

### Functions

* **Traditional**

  * Input `.walt`
  ```javascript
  function x() : i32 {
    return 2;
  }
  ```
  * Output `.wast`
  ```
  (func $x (result i32)
    (return (i32.const 2)
  )
  ```

* **Arrow functions**
  - Input `.walt`
  ```javascript
  x = () : i32 => 2;
  ```
  - Output `.wast`
  ```
  (func $x (result i32) (i32.const 2))
  ```
### Module

* `.wast`
```
(module
  ;;; code here
)
```

Every `.walt` file is a module and is compiled into the above. Similar to node modules every module has access to a magic `module` global. `module` is a reserved keyword

### Improting  modules

* `counter.walt`
```javascript
let counter: i32 = 0;
// modules with exports get assigned linker names
export function count() : i32 {
  return counter++;
}
```

* `main.walt`
```javascript
import { count(): i32 }  from './counter'; // counter.walt

export addCount = (value: i32): i32 => count() + value;
```

