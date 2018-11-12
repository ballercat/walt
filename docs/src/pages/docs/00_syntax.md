---
title: Syntax
path: /syntax
---

## Basic Types

| Syntax | s-expression | Native? |
| :----: | :----------: | :-----: |
| `i32`  |   `(i32)`    |   ✅    |
| `f32`  |   `(f32)`    |   ✅    |
| `i64`  |   `(i64)`    |   ✅    |
| `f64`  |   `(f64)`    |   ✅    |

Walt supports all of the native WebAssembly types. They can be used in
expressions, assigned to variables, returned from functions, imported and
exported from modules.

## Function Types

| Syntax                             | s-expression                                 | Native? |
| ---------------------------------- | -------------------------------------------- | ------- |
| `type Fun1Type = () => void`       | `(type (func))`                              | ✅      |
| `type Fun2Type = (i32) => void`    | `(type (func (param i32)))`                  | ✅      |
| `type Fun3Type = (i32) => i32`     | `(type (func (param i32) (result i32)))`     | ✅      |
| `type Closure = Lambda<Func3Type>` | `(type (func (param i32 i32) (result i32)))` | ❌      |

Walt supports all native WebAssembly type definitions. Type definitions are
necessary for module imports and function pointers. Lambdas are an exception as
they are not natively supported by WebAssembly, a lambda type is encoded with an
additional `i32` which is used as a memory offset for the closure environment.

## Special Types

| Syntax                                                          | s-expression          | Native? |
| --------------------------------------------------------------- | --------------------- | ------- |
| `const mem: Memory = { initial: 0, max: 1 }`                    | `(memory 0 1)`        | ✅      |
| `const table: Table = { initial: 1, max: 1, element: anyfunc }` | `(table 1 1 anyfunc)` | ✅      |

`Memory` and `Table` types are used only to define the corresponding module
header. Both can be used to import a table or memory from the environment,
however.

## Array Types

| Syntax  | s-expression | Native? |
| :-----: | :----------: | :-----: |
| `i32[]` |   `(i32)`    |   ❌    |
| `f32[]` |   `(f32)`    |   ❌    |
| `i64[]` |   `(i64)`    |   ❌    |
| `f64[]` |   `(f64)`    |   ❌    |

Array types are used to declare variables which will be used as arrays in the
source code. They are only necessary as compiler hints and compile down to basic
types in the final binary.

## Struct Types

| Syntax                                   | s-expression | Native? |
| ---------------------------------------- | ------------ | ------- |
| `type abcs = { a: i32, b: i32, c: i32 }` | ---          | ❌      |

Struct types are used as compiler hints to Walt when assigning to and accessing
structured data in memory.

## Declarations

All declarations are created via `const` and `let`. The global or local scope is
determined by where the variables are defined. Each declaration uses the
_type-cast_ operator `:`. 🦄 _In the future, type inference will be available
for left-hand-side of the declaration and the type operator will be optional._

### With Globals

| Syntax             | s-expression                       | Native? |
| ------------------ | ---------------------------------- | ------- |
| `const x: i32 = 0` | `(global i32 (i32.const 0))`       | ✅      |
| `let x: i32 = 0`   | `(global (mut i32) (i32.const 0))` | ✅      |

### With Function Locals

| Syntax             | s-expression                              | Native? |
| ------------------ | ----------------------------------------- | ------- |
| `const x: i32 = 0` | `(local i32) (set_local 0 (i32.const 0))` | ❌      |
| `let x: i32 = 0`   | `(local i32) (set_local 0 (i32.const 0))` | ✅      |

Notice that both `const` and `let` compile into the same WebAssembly
expression(s). This is because WebAssembly _has no native immutable locals_.
Using `const` is a compiler hint, which will result in a compile-error if you
attempt to re-assign to a `const` variable.

### With Function, Object and Lambda types

| Syntax                       | s-expression                              | Native? |
| ---------------------------- | ----------------------------------------- | ------- |
| `let ptr: FnType = 0`        | `(local i32) (set_local 0 (i32.const 0))` | ❌      |
| `let obj: StructType = 0`    | `(local i32) (set_local 0 (i32.const 0))` | ❌      |
| `let lambda: LambdaType = 0` | `(local i64) (set_local 0 (i64.const 0))` | ❌      |

Function pointers are encoded as a 32-bit table address. Struct variables are
encoded as a 32-bit memory offset. Lambdas are a special case of a
[fat pointer](https://www.quora.com/What-is-a-fat-pointer) containing both a
memory offset(LSW) and a table index for the lambda used(MSW), encoded as a
64-bit integer.

## Math

| Syntax | s-expression | Native? |
| :----: | :----------: | :-----: |
|  `+`   |  `type.add`  |   ✅    |
|  `-`   |  `type.sub`  |   ✅    |
|  `/`   | `type.div_s` |   ✅    |
|  `*`   |  `type.mul`  |   ✅    |
|  `%`   | `type.rem_s` |   ✅    |
|  `&`   |  `type.and`  |   ✅    |
|  `\|`  |  `type.or`   |   ✅    |
|  `^`   |  `type.xor`  |   ✅    |
|  `<<`  |  `type.shl`  |   ✅    |
|  `>>`  | `type.shr_s` |   ✅    |

🦄 \_In the future versions of Walt, all of the math operators will be exposed
as function members of a native type. For example `i32.shr_u(x, y)`.

## Type-casts and Promotions

All operations in WebAssembly must adhere to the strict type of the operator.
This means that mixing types requires every mismatched operand to be typecast as
the type of the operation. This can get very tedious and fast as different type
conversions require different typecasts. Walt makes this a bit easier by
performing [type promotion](https://en.wikipedia.org/wiki/Type_conversion) in
binary expressions behind the scenes. All types are promoted in an expression to
the type with the highest expression _weight_.

### Type Weights

| Type  | Weight |
| :---: | :----: |
| `f64` |   4    |
| `f32` |   3    |
| `i64` |   2    |
| `i32` |   1    |

### Manual Type-casts

TODO; `:` operator and output WebAssembly

### Statements and Expressions

Walt splits its syntax into statements and expressions (like JavaScript).

### Comments

Walt supports JavaScript comments, inline comments `//` and multi-line comment
blocks `/* */`.

### Functions

Everything in Walt as in WebAssembly must have a Type. Functions are no
exception to the rule. When a function is declared it's type is hoisted by the
compiler behind the scenes. A function type is a list of parameters and a result
type.

:unicorn: Currently a custom function type syntax is not implemented, but is
required in order to use custom-function imports.

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

### Arrays, Object, Memory

Simple rules about objects and arrays.

- Both arrays and objects are stored in the heap, NOT on the stack
- Walt has no built-in memory functions like `new` or `delete`
- There is no _special_ syntax for pointers, regular 32-bit address integers are
  used
- Every object and array must be initialized with an address.
- Every custom object must have a corresponding type definition
- Object Type definitions are _not_ present in any way in the final binary
  output. They are used as compiler hints.
- `type` keyword is used to create a new user-type. Types can be object or
  function types.
- Dynamic keys are not allowed/will not work.
- _Except_ for arrays, which currently have no out-of-bounds checks.
- Arrays of custom types are _not yet_ supported
- Walt **does not implicitly import Memory**, memory must be manually imported
  OR declared before any memory operations can be used.

Mainly these makes it easier to write a compiler for Walt. Interop between
JavaScript and Walt becomes simpler as well and the "syntax sugar" is kept to a
minimum on top of the existing WebAssembly functionality.

Before using arrays or objects memory must be declared

```javascript
const memory: Memory = { initial: 0 };
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
type FooType = { foo: i32 };

// Objects must be initialized with an address
// NOTE: Walt runtime will _not_ perform any safety checks on this address
const foo: FooType = 0;

// Property lookups are performed as string subscripts
foo['foo'] = 200;

// Because objects are compiled down to a single integer address, they can be freely
// passed around to other functions or put into other objects
someOtherFunction(foo); // (i32) => void
```

### Module

Every Walt file is compiled into a stand-alone module. `module` is a
future-reserved keyword.
