---
title: Syntax
path: /syntax
---

## Declarations and Built-in Types

All declarations in Walt are done via the `const` and `let` keyword. WebAssembly
does not support `const` by default so this is simply a sugar which will prevent
re-assignment.

The global or local scope is determined by where the variables are defined. Each
declaration uses the _type-cast_ operator `:` to define the type of variable.

Walt supports all of the native WebAssembly types. They can be used in
expressions, assigned to variables, returned from functions, imported and
exported from modules.

### Numbers

<sandbox>
```
// Basic numbers
let x : i32 = 0;
const y : f32 = 0;
const z : i64 = 0;
let w : f64 = 0;
```
</sandbox>

Walt exposes the four native WebAssembly types directly: `i32`, `f32`, `i64`,
`f64`.

### Function types

<sandbox>
```
type Fun1Type = () => void;
type Fun2Type = (i32) => void;
type Fun3Type = (i32) => i32;
```
</sandbox>

Walt supports native WebAssembly function type definitions. Type definitions are
necessary for module imports and function pointers. All functions defined have
an underlying function type in WebAssembly.

### Memory & Table

<sandbox>
```
// Memory and table types
const memory : Memory = {
  initial: 0,
  max: 1
};
```
```
// Table definition
const table : Table = {
  initial: 1,
  max: 1,
  element: anyfunc
};
```
</sandbox>

In addition to basic number types, the `Memory` and `Table` types are also
exposed which are used to define the corresponding module header.

## Data Types

Walt provides special syntax sugar types for working with structured data and
memory. The _struct_ and _array_ types are the two simple ways to view into and
change memory in a Walt program. Both act as simple views into structured data.

### Arrays

<sandbox>
```
function demo() {
  // A value assigned to an arrays sets the base
  // address of the array view
  const i32Array : i32[] = 0;
  const f32Array : f32[] = 0x20;
  const i64Array : i64[] = 0x40;
  const f64Array : f64[] = 0x80;
  // Once defined array variables can be indexed
  // just like arrays in JavaScript
  const x : i32 = i32Array[1];
}
```
</sandbox>

Array types are used to declare variables which will be used as arrays in the
source code. They are only necessary as compiler hints and compile down to basic
types in the final binary.

### Struct Types

<sandbox>
```
// Note that the object type is not compiled
// into result wasm binary (unline functions)
type Object = {
  a: i32,
  b: i32,
  c: i32
};
// the type above is used by the compiler to
// read and write memory
function test() {
  const obj : Object = 0;
  obj.a = 42;
  const array : i32[] = obj;
  array[0] = 42;
}
```
</sandbox>

Struct types are used as compiler hints to Walt when assigning to and accessing
structured data in memory.

## Program Structure

Every Walt file is compiled into a stand-alone module. `module` is a
future-reserved keyword.

A single Walt module is made up of one or more statements (though empty modules
are still valid). Only statements are allowed at the global scope, like global
variable declarations, imports and function declarations. All logic of a Walt
(and WebAssembly) program must exist in one or more declared functions.

### Comments

Walt supports JavaScript comments, inline comments `//` and multi-line comment
blocks `/* */`.

### Functions

<sandbox>
```
function a() : i32 {
  return 42;
}
function nothing(x: i32) {
  const x : i32 = x * 2;
}
```
</sandbox>

Everything in Walt as in WebAssembly must have a Type. Functions are no
exception to the rule. When a function is declared it's type is hoisted by the
compiler behind the scenes. A function type is a list of parameters and a result
type. For functions without a return value a return type may be omitted.

### Control Flow

#### If ... then ... else

<sandbox>
function demo(a : i32, b : i32) : i32 {
  if (a > b) {
    return 1;
  } else if (b > a) {
    return -1;
  }
  return 0;
}
</sandbox>

#### Ternary

<sandbox>
function demo(a : i32, b : i32) : i32 {
  return a > b ? 1 : (b > a ? -1 : 0);
}
</sandbox>

**Note**: Ternaries are compiled as `select` opcodes. Select operations in
WebAssembly evaluate _both_ options regardless of the condition!

#### Loops

<sandbox>
function demo(iterations: i32) : i32 {
  let result : i32 = 0;
  let i : i32;
  // for loop
  for(i = 0; i < iterations; i += 1) {
    result += i;
  }
  // while loop
  i = iterations;
  while(i -= 1) {
    result += 1;
  }
  return result;
}
</sandbox>

#### Switch

Not implemented.

### Imports and Exports

<sandbox>
```
// Functions and constants can be imported
import { log : Log, Const: i32 } from 'env';
// Types for imported functions must exist
type Log = (i32) => void;
// constants can be exported as well
export const someValue : i32 = 0xf8f8;
// so can memory (or table)
export const memory : Memory = { initial: 1 };
// and functions of course
export function demo() : i32 {
  log(42);
  return 42;
}
```
</sandbox>

## Typecasts and Type Promotions

### Typecasts

<sandbox>
function demo() {
  // Truncations
  let float64 : f64 = 1.2;
  let int32 : i32 =float64 : i32;
}
</sandbox>

Any value can be type casted at will with the `:` typecast operator.

### Promotions

<sandbox>
function demo() {
  // Promotions/Extend
  let float64 : f64 = (2 : i64);
  // Conversion
  let int32 : i32 = 2 + (float64 / 2);
}
</sandbox>

All operations in WebAssembly must adhere to the strict type of the operator.
This means that mixing types requires every mismatched operand to be typecast as
the type of the operation. This can get very tedious and fast as different type
conversions require different typecasts. Walt makes this a bit easier by
performing [type promotion](https://en.wikipedia.org/wiki/Type_conversion) in
binary expressions behind the scenes.

### Function imports and pointers

It is possible to import custom functions and use wasm functions as callbacks.

<sandbox>
```
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
</sandbox>

- Compiling the above example will require a `WebAssembly.Table` import to be
  provided in the imports object.

Keep in mind that the `Function` parameter is encoded into an `i32` table index.
This means that the `setTimeout` function must be a wrapper which can get the
_real_ wasm function pointer from a table object. Like so:

```javascript
{
  setTimeout: (tableIndex, timeout) => {
    const pointer = tableInstance.get(tableIndex);
    setTimeout(pointer, timeout);
  };
}
```
