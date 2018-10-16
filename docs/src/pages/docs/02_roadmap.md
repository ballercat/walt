---
title: Roadmap
path: /roadmap
---

# Future 🦄 
- Custom string types (maybe)
- Docs [ongoing]
- LHS expression type inference
- function level type inference 
- Generators
- Promise Demo
- WebGL demo
- Threads support
- Native GC


## 0.5.0
- ✅Static strings
- ✅Data section
- ✅Binary NOT operator (~)
- ✅Logical NOT operator (!)
- ✅Native load/store operators
- [Imports](https://github.com/ballercat/walt/pull/113)
- [CLI](https://github.com/ballercat/walt/pull/113)
- [Nested structs, closures](https://github.com/ballercat/walt/issues/72)
- [Destructuring Assignment](https://github.com/ballercat/walt/issues/64)

## ✅[0.4.0](https://github.com/ballercat/walt/pull/94)
- ✅[Correct i64 encoding w/o typecasts](https://github.com/ballercat/walt/pull/78)
- ✅🐞[Global Array Encoding](https://github.com/ballercat/walt/pull/78)
- ✅[Name section [DX]](https://github.com/ballercat/walt/issues/21)
- ✅[Memory, Table as generic type](https://github.com/ballercat/walt/issues/89)
- ✅Global config [meta][refactor]
- ✅[Metadata refactor - code debt](https://github.com/ballercat/walt/pull/97)

## ✅0.3.0 - Alpha
- ✅[Closures](https://github.com/ballercat/walt/pull/66) 
- ✅[Monorepo, npm package [meta]](https://github.com/ballercat/walt/pull/53)
- ✅[Remove generator calls out of the parser](https://github.com/ballercat/walt/issues/51) 
- ✅[Semantic Analyzer](https://github.com/ballercat/walt/issues/49)
- ✅[Webpack loader MVP](https://github.com/ballercat/walt/issues/50) 
- ✅[Array Type function arguments](https://github.com/ballercat/walt/issues/43) 
- ✅🐞[Undefined type imports should throw](https://github.com/ballercat/walt/issues/20) 
- ✅[Better "No ASI" warnings](https://github.com/ballercat/walt/issues/25)
- ✅[else if](https://github.com/ballercat/walt/issues/19) 
- ✅[Logical operators](https://github.com/ballercat/walt/issues/34) 
- ✅[Bitwise operators](https://github.com/ballercat/walt/issues/33) 
- ✅[Dot operator](https://github.com/ballercat/walt/issues/28) 
- ✅[Spread Operator](https://github.com/ballercat/walt/issues/23)  
- ✅🐞[Numbers inside identifiers](https://github.com/ballercat/walt/issues/42)
- ✅🐞[64 bit local function vars](https://github.com/ballercat/walt/issues/40)

## 0.2.1
- Unary (-) operator

## 0.2.0
- sizeof
- typecasts `(1 : f32), (0.5 : i32)` etc.
- top-level typecasts for expressions
- type promotions in math expressions
- type safety and warnings in binary expressions
- Canvas example
- Increment/decrement and assign +=/-=
- basic support for the break keyword
- node mapper

## 0.1.0
- Stand-Alone `.walt` example files
- Object literals generated into the binary
- Object literal `.walt` example

## 0.0.2

* `CHANGELOG.md`
* `Memory` pre-defined type
* Object literal syntax parser
* Single line comment
* `Memory` type must be explicitly defined before memory can be used
* Arrays can be indexed on any i32 offset
* Removed `new` keyword support
* Removed Implicit import of memory

## 0.0.1 - The Genesis 

* Examples
* Tokenizer
* Exports: functions, constant globals
* Declarations
* BinaryExpressions
* Local Scope & Global Scope
* Compile time warnings and errors
* Function imports
* Emitter
* Exports
* Functions
* Types - wasm built ins(i32/f32)
* custom function type imports
* Globals, Locals

## Legend
* 🐞 - bug
* ✅ - finished
* 🚫 - blocked
* 🔨 - work in progress
* native - Part of WebAssembly spec
