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
1. Use ES6 like syntax
2. Type annotations (similar to flow).
3. Simplify exports and imports
4. Fast compilation
5. Compile from `.walt` to `.wasm` directly
6. Webpack loader to convert `.walt` files to importable JavaScript modules
7. Test Suite

# Notes
* WebAssembly spec https://github.com/WebAssembly/wabt
* WebAssembly Text format semantics. https://github.com/WebAssembly/design/blob/master/Semantics.md
* WebAssembly semantics test suite https://github.com/WebAssembly/spec/tree/master/test/core
* WebAssembly Binary Toolkit https://github.com/WebAssembly/wabt.
* S-syntax https://github.com/WebAssembly/spec/tree/master/interpreter#s-expression-syntax

# Spec (WIP)

### Reserved Keywords

* Reserved words from JavaScript:
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

* Reserved words from S-expression-syntax (todo) :
```
global
i32
```

### Expressions

Each expression must end in a `;`

### Comments

* Input `.walt`
```javascript
// single line comment
/**
  multi
  line
  comment
**/
```

* Result `.wast`
```
;; single line comment
(;
  multi
  line
  comment
;)
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
global i32 counter = 0;
function count() : i32 {
  return counter++;
}
export count; // modules with exports get assigned linker names
```

* `main.walt`
```javascript
import { function count : i32 }  from './counter'; // counter.walt
count(); // 0
count(); // 1
```

Output `.wast`:

```
(module $__M0
  (global $counter (mut i32) (i32.const 0))
  (func $count (result i32)
    (set_global $counter
      (i32.add $get_global $counter (i32.const 1))
    )
    (return (get_global $counter))
  )
  (export "count" (func $count)) ; modules with exports get assigned linker names
)
(register "counter" $__M0)
(module
  (func $count (import "counter" "count") (result i32)) ; counter.walt
  (call $count) ; 0
  (call $count) ; 1
)
```

### Memory

* Input `.walt`
```javascript
import Memory from 'Memory';
module.memory = Memory(0, 256);
```

* Result `.wast`
```
(memory 1, 256)
```
- Import a module `Memory` to create a new memory entry
- Module memory must be set on the `module.memory`. Only one memory entry is currently allowed, per the wasm spec.





