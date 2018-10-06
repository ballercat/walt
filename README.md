<p align="center">
  <img src="walt.png" width="117" height="74"><br><br>
  <b>Walt</b> |
  <i>Alternative Syntax for WebAssembly</i> |
  <a href="https://ballercat.github.io/walt/">Demo</a>
</p>
<p align="center">
  <a href="https://travis-ci.org/ballercat/walt"><img src="https://travis-ci.org/ballercat/walt.svg?branch=master" alt="Build Status"></a>
  <a href="https://github.com/ballercat/walt/issues"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions welcome"></a>
  <a href="https://coveralls.io/github/ballercat/walt?branch=master"><img src="https://coveralls.io/repos/github/ballercat/walt/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier"></a>
  <a href="https://gitter.im/walt-js-wasm/Lobby"><img src="https://badges.gitter.im/gitterHQ/gitter.png" alt="Gitter chat"></a>
</p>

:zap: **Walt** is an alternative syntax for WebAssembly text format. It's an experiment for using JavaScript syntax to write to as 'close to the metal' as possible. _It's JavaScript with rules._ `.walt` files compile directly to WebAssembly binary format.

Highlights:

* Write _"close to the metal"_ JavaScript!
* **No C/C++ or Rust required**, just _typed_ JavaScript.
* **NO LLVM/binary toolkits required**, zero dependencies 100% written in JS.
* Fast compilation, integrates into webpack!


:book: Read the [Quick Start Guide](https://github.com/ballercat/walt/wiki/Walt-In-5-Minutes)

:rocket: Try it out in the [Walt Explorer](https://ballercat.github.io/walt/).

:pray: Contributions are welcomed! [Contributing guide](https://github.com/ballercat/walt/blob/master/CONTRIBUTING.md).

:hatched_chick: Current status: **Alpha**

### [Roadmap](https://github.com/ballercat/walt/wiki/Roadmap)

# Problem

Writing zero-overhead, optimized WebAssembly is pretty tough to do. The syntax for `.wat` files is terse and difficult to work with directly. If you do not wish to use a systems language like C or Rust,
then you're kind of out of luck. Your best bet (currently) is to write very plain C code, compile that to .wast and then optimize that result. Then you're ready to compile that into the final WebAssembly binary. This is an
attempt to take C/Rust out of the equation and write 'as close to the metal' as possible without losing readability.

I feel like this is currently a problem. Most Web engineers are not familiar with the C family languages or Rust. It's a barrier for wide spread adoption of WebAssembly. A competent Front-end engineer
should be able to edit WebAssembly as easily as any other systems programmer.

# Solution

Provide a **thin layer** of syntax sugar on top of `.wat` text format. Preferably porting as much of JavaScript syntax to WebAssembly as possible. This improved syntax should give direct control over
the WebAssembly output. Meaning there should be minimal to none post optimization to be done to the wast code generated. The re-use of JavaScript semantics is intentional as I do not wish to create a brand new language.

Here is what an example of a `.walt` module which exports a recursive Fibonacci function looks like:

```js
export function fibonacci(n: i32): i32 {
  if (n <= 0) return 0;

  if (n == 1) return 1;

  return fibonacci(n - 1) + fibonacci(n - 2);
}
```


When this code is ran through the walt compiler you end up with a buffer which can be used to create a WebAssembly module with a `fibonacci` export just as you would expect. All done with familiar JS syntax and without any external binary toolkits! A working demo of this exists in the `fibonacci-spec.js` [unit test file](https://github.com/ballercat/walt/blob/master/packages/walt-compiler/src/__tests__/fibonacci-spec.js).

# Project Goals

The ultimate goal of Walt is to make WebAssembly accessible to average JavaScript engineer by providing a subset of JavaScript syntax which compiles to WebAssembly bytecode directly. That WebAssembly should be easy to make use of and simple to integrate into an existing project with the current build tools.

## Use cases

Pretty much everyone who wants a quick-start into wasm can use Walt to get there. The use-cases are not specific to this project alone but more to WebAssembly in general. The fact that Walt does not require a stand-alone compiler and can integrate into any(almost?) build tool still makes certain projects better candidates over others.

* Web/Node libraries, looking to improve performance.
* Games
* Projects depending on heavy real-time computation from complex UIs to 3D visualizations
* Web VR/AR
* Anyone interested in WebAssembly who is not familiar with system languages.

See [Wiki](https://github.com/ballercat/walt/wiki) for detailed design decisions etc.

## Prior Art
* [wah](https://github.com/tmcw/wah) - A slightly higher level syntax on top of the wasm text format
* [mini-c](https://github.com/maierfelix/mini-c) - Experimental C to WebAssembly compiler

## Contributors

[<img alt="ballercat" src="https://avatars2.githubusercontent.com/u/743990?v=4&s=117" width="117">](https://github.com/ballercat) |[<img alt="tbroadley" src="https://avatars0.githubusercontent.com/u/8731922?v=4&s=117" width="117">](https://github.com/tbroadley) |[<img alt="thomassturm" src="https://avatars3.githubusercontent.com/u/276995?v=4&s=117" width="117">](https://github.com/thomassturm) |[<img alt="Baransu" src="https://avatars2.githubusercontent.com/u/9558691?v=4&s=117" width="117">](https://github.com/Baransu) |[<img alt="whitecrownclown" src="https://avatars0.githubusercontent.com/u/8309417?v=4&s=117" width="117">](https://github.com/whitecrownclown) |[<img alt="balajmarius" src="https://avatars3.githubusercontent.com/u/5159921?v=4&s=117" width="117">](https://github.com/balajmarius) |
:---: |:---: |:---: |:---: |:---: |:---: |
[ballercat](https://github.com/ballercat) |[tbroadley](https://github.com/tbroadley) |[thomassturm](https://github.com/thomassturm) |[Baransu](https://github.com/Baransu) |[whitecrownclown](https://github.com/whitecrownclown) |[balajmarius](https://github.com/balajmarius) |

[<img alt="hlaaftana" src="https://avatars0.githubusercontent.com/u/10591326?v=4&s=117" width="117">](https://github.com/hlaaftana) |[<img alt="ForsakenHarmony" src="https://avatars3.githubusercontent.com/u/8845940?v=4&s=117" width="117">](https://github.com/ForsakenHarmony) |[<img alt="hamlim" src="https://avatars2.githubusercontent.com/u/5579638?v=4&s=117" width="117">](https://github.com/hamlim) |[<img alt="petetnt" src="https://avatars2.githubusercontent.com/u/7641760?v=4&s=117" width="117">](https://github.com/petetnt) |[<img alt="novoselrok" src="https://avatars2.githubusercontent.com/u/6417322?v=4&s=117" width="117">](https://github.com/novoselrok) |[<img alt="Dragas" src="https://avatars2.githubusercontent.com/u/6078508?v=4&s=117" width="117">](https://github.com/Dragas) |
:---: |:---: |:---: |:---: |:---: |:---: |
[hlaaftana](https://github.com/hlaaftana) |[ForsakenHarmony](https://github.com/ForsakenHarmony) |[hamlim](https://github.com/hamlim) |[petetnt](https://github.com/petetnt) |[novoselrok](https://github.com/novoselrok) |[Dragas](https://github.com/Dragas) |

