---
title: Closures
path: /cloures
---

# Intro
Closures are a very powerful abstraction in JavaScript, because of this Walt supports a very straightforward syntax for working with closures.

## Syntax

A closure is a function which is defined by the ES6-like anonymous arrow function syntax. Unlike regular functions in JavaScript, an inner closure can only be created with an arrow function.

Like function pointers, a closure _instance_ must be associated with an appropriate type definition. In Walt a regular function type can be modified with the `lambda` keyword to indicate to the compiler that this function type will be used as a closure.

```js
// Reads as: "a function type, which is a lambda taking no arguments and returning 32-bit integer"
type lambda Closure = () => i32;
```

**A table must be present in the module before you can invoke closures**. A closure call is ultimately an `indirect_call`/function-pointer and requires a table.

```js
const table: Table = { element: anyfunc, initial: 1 };
```

Unlike regular functions types(like the ones used for imports), lambdas are _64-bits_ wide. Without the `lambda` modifier a function type will be treated as a regular function pointer type, which _32-bits_ wide.

**To return a closure from a function** all you need to do is annotate it with a lambda type and return a closure.

```js
function getCounter(): Closure => {
  let x: i32 = 0;
  // Not a very useful closure, but good enough for a demo
  return (): i32 {
    x += 1;
    return x;
  }
}
```

**To store a closure in a variable**, a variable must be annotated with the closure Type.

```js
const count: Closure = getCounter();
```

A closure is used just like any other function pointer.

```js
function test(): i32 {
  // create a variable
  const count: Closure = getCounter();
  count();
  count();
  // this will be 3
  return count();
}
```

## Compiling
Closures are a _optional_ feature. The compiler will not generate any additional code to handle them unless they are used within the source. When you do define a closure within your source, the compiler will generate imports for a `walt-plugin-closure`. This import must exist in order for closures to be used and invoked in the final WebAssembly binary.

Using the closure plugin is rather simple and can be seen in the [Explorer Demo page](https://ballercat.github.io/walt/)

```js
import compiler, { closurePlugin, withPlugins } from 'walt-compiler';

// First we need an instance of the closure plugin
WebAssembly.instantiate(closurePlugin()).then(closure => {
  return WebAssembly.instantiate(
    // walt source code to buffer    
    compiler(source),
    // Inject the plugin into the importsObj
    withPlugins({
      closure
    })).then(module => {
      const test = module.instance.exports.test;
      console.log(test());
    });
});
```

_Future version of the compiler will have a helper method which will abstract this for you_.

### Plugin
The purpose of the plugin is to define **a separate memory space for dynamic closures**. Walt does not come with a memory runtime and never touches the memory defined in your module implicitly. To get around this, features that _do_ require dynamic memory are offloaded to another WebAssembly module which is dynamically linked during compilation, a plugin. Because the imports are other WebAssembly methods, **there is no additional overhead to invoking these methods**.

This abstraction allows for the end-user to overwrite the closure plugin. You may decide you have a better or more performant closure allocator that you'd like to use. You can even define the plugin methods entirely in JavaScript, however that will incur a runtime penalty for invoking JS functions from WebAssembly.

_*At this point the default Closure plugin is very basic and does not fully implement a free() method_.

#### ABI
The following imports and types are injected at the top of your module when using closures.

```js
    import {
      'closure-malloc': ClosureGeti32,
      'closure-free': ClosureFree,
      'closure--get-i32': ClosureGeti32,
      'closure--get-f32': ClosureGetf32,
      'closure--get-i64': ClosureGeti64,
      'closure--get-f64': ClosureGetf64,
      'closure--set-i32': ClosureSeti32,
      'closure--set-f32': ClosureSetf32,
      'closure--set-i64': ClosureSeti64,
      'closure--set-f64': ClosureSetf64
    } from 'walt-plugin-closure';
    type ClosureFree = (i32) => void;
    type ClosureGeti32 = (i32) => i32;
    type ClosureGetf32 = (i32) => f32;
    type ClosureGeti64 = (i32) => i64;
    type ClosureGetf64 = (i32) => f64;
    type ClosureSeti32 = (i32, i32) => void;
    type ClosureSetf32 = (i32, f32) => void;
    type ClosureSeti64 = (i32, i64) => void;
    type ClosureSetf64 = (i32, f64) => void;
```

You are free to overwrite all of a subset of these imports via the `importsObject` argument.

## Details for Nerds

For low-level implementation details see [Closures PR](https://github.com/ballercat/walt/pull/66)