---
title: Project Goals
path: /goals
---

# Project Goals
The ultimate goal of Walt is to make WebAssembly accessible to average JavaScript engineer by providing a subset of JavaScript syntax which compiles to WebAssembly bytecode directly. That WebAssembly should be easy to make use of and simple to integrate into an existing project with the current build tools.

## Use cases
Pretty much everyone who wants a quick-start into wasm can use Walt to get there. The use-cases are not specific to this project alone but more to WebAssembly in general. The fact that Walt does not require a stand-alone compiler and can integrate into any(almost?) build tool still makes certain projects better candidates over others.

* Web/Node libraries, looking to improve performance. 
* Games
* Projects depending on heavy real-time computation from complex UIs to 3D visualizations
* Web VR/AR
* Anyone interested in WebAssembly who is not familiar with system languages.

# Design Decisions
While Walt tries hard to marry JavaScript syntax with wasm, it also does not attempt to _rewrite JavaScript from scratch_. It's important to remember that we are using a syntax sugar over wasm, not a brand new language. The origin of Walt was a need for a way to write small, performant WebAssembly modules with as few tools as possible as fast as possible. It does this by following a few broad rules.

### WebAssembly with JavaScript syntax
Walt is not JavaScript; it's WebAssembly with friendly syntax. 

Writing wasm in S-expressions is not easy. It's doable, and it's just not easy to do. JavaScript, on the other hand, has a very friendly syntax. Above all lot's more people, including myself are more comfortable with JavaScript over C++ or Rust for example. Walt tries to hit the sweet spot of a low-level language with a high-level easy to write syntax, and that is all it does.

### WYSIWYG or No Surprises.
Compiling a system language to WebAssembly is pretty straightforward. _Running_ this compiled code is _not at all_. C++ was not designed to run on the web. There is a ton of glue/runtime code which needs to exist to make even a single `std::cout << "Hello World!" << std::endl;" translate to a working WebAssembly. So you set out to explore wasm and write something pretty basic but end up with a giant behemoth of a module with thousands of lines of JavaScript glue code. Walt attempts to demystify WebAssembly and avoids this scenario entirely.

Sticking with the theme of _" it's just WebAssembly"_, there is no attempt to provide additional niceties over compiled output. You get back what you wrote. You may have skipped a few steps to get there, but it's still the code you intended. What this results in, is predictable code, but it also means that Walt does not implement the following

* A runtime library/compatibility layer
* DOM bindings
* Opaque imports/exports
* Implicit memory declarations and memory management

What Walt does do is make it easy for you to import any number of utilities that do this for you. And in time, when WebAssembly has native GC or native DOM bindings, Walt will make that available!

### Do it Yourself
Walt holds no opinions about how memory should be managed in your module or how Web APIs should be exposed. That is all up to you. Walt simply gives you the tools to do so yourself. You may include a `malloc/free` utility, or import a `document.createElement` wrapper, but you also may find that you don't need _any_ memory management or that you'd like to expose your micro-optimized version.

When it comes to low-level details, there isn't a catch-all which works for all Applications and all use-cases. Walt attempts to free API/tool authors to provide these themselves, instead of forcing a one-size-fits-all solution.
