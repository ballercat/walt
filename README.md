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
Provide a **thin layer** of syntax sugar on top of `.wast` text format. Preferably providing as much of JavaScript syntax to WebAssembly as possible. This improved syntax should give direct control over
the WebAssembly output. Meaning there should be minimal to none post optimization to be done to the wast code generated.

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

# Spec (WIP)

### Expressions

Each expression must end in a `;`

### Comments

```javascript
// single line
/** multi-line **/
```

### Module

* `.wast`
```
(module
  ;;; code here
)
```

Every `.walt` file is a module and is compiled into the above. Similar to node modules every module has access to a magic `module` global. `module` is a reserved keyword

### Memory

* `.wast`
```
(memory 1, 256)
```

* `.walt`
```javascript
module.memory = new Memory(0, 256);
```

Module memory must be set on the `module.memory`. Only one memory entry is currently allowed, per the wasm spec.





