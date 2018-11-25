# Automatic Reference Counting

This plugin implements ARC for the Walt WebAssembly Syntax

## Status - Alpha

## Goal

The goal of this project is to privde a lightweight memory management scheme for
writing WebAssembly programs with the Walt syntax.

* All left-hand object literals become explicit allocations of the type specified.
* All left-hand array literals become explicit allocations.
* Should make closure syntax viable.
* Cycles not supported (weak references TBD)

```js
type Node = {
  data: i32,
  left: Node,
  right: Node
};

function test() {
  const node : Node = {
    data: 0,
    left: null,
    right: null
  };
}
```
