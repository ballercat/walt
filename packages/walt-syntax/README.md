# Walt Syntax

Syntax definitions for the Walt, WebAssembly Alternative Syntax.

## Syntax

### Numbers

* [x] decimals `1, 20, 42`
* [x] floating point `1.1`
* [x] hex `0xFF`

### Stings

* [x] character literals `'x'`
* [x] words `"hello world!"`\*

_\*words require a memory to be present in the module_

### Types

* [x] `i32`
* [x] `i64`
* [x] `f32`
* [x] `f64`
* [ ] `u32`
* [ ] `u64`

### Keywords

Most JavaScript keywords are supported and have similar(when possible) semantics.

* [x] `break`
* [x] `if`
* [x] `else`
* [x] `import`
* [x] `as`
* [x] `from`
* [x] `export`
* [x] `return`
* [ ] `switch`
* [ ] `case`
* [x] `default`
* [x] `const`
* [x] `let`
* [x] `for`
* [x] `continue`
* [x] `do`
* [x] `while`
* [x] `function`

### Native

## Abstract Syntax Tree

Syntax nodes are Plain Old JavaScript Objects.

```
export type NodeType = {
  range: Marker[],
  Type: string,
  type: string | null,
  value: string,
  meta: { [string]: any },
  params: NodeType[],
};
```

`Type` is a pre-defined walt-specific string constant. For a full list of these constants, refer to the source. `type`(lowercase) is the WebAssembly type and must be one of `i32 | f32 | i64 | f64` or the literal `null` value which represents a void value. Note: Any valid string _could_ be the `type` value but only the 5 supported values above will _compile_.

`params` are the children of the node.

`meta` is used to hold information about the node which is not present in the source program and is either inferred or implied. For example a struct type definition may contain the key value offsets which are used to compile it's property look ups.

## Compile-able AST Types

While many different nodes are possible a strict subset of node `Type` are considered valid by the generator and are compile-able.

```
  Syntax.Typedef,
  Syntax.Import,
  Syntax.Export,
  Syntax.FunctionDeclaration,
  Syntax.FunctionCall,
  Syntax.IndirectFunctionCall,
  Syntax.Constant,
  Syntax.BinaryExpression,
  Syntax.TernaryExpression,
  Syntax.IfThenElse,
  Syntax.Else,
  Syntax.Select,
  Syntax.Block,
  Syntax.Identifier,
  Syntax.FunctionIdentifier,
  Syntax.FunctionPointer,
  Syntax.ReturnStatement,
  Syntax.Declaration,
  Syntax.ArraySubscript,
  Syntax.Access,
  Syntax.Assignment,
  Syntax.MemoryAssignment,
  Syntax.Loop,
  Syntax.Break,
  Syntax.TypeCast,
  Syntax.Noop,
  Syntax.NativeMethod
```
