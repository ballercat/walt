# Variables

`<global|const>? <type> <identifier>`

1. Each variable declaration must begin with either:

* `const` keyword, indicating a constant variable. Optional
* `global` keyword, indicating a global variable. Optional
  * `global` declarations can only be made at [global scope](./scope.md#global)
* `i32|i64|f32|f64` type

2. Followed by the *identifier*

* Variables do not need to start with `$`.
* Variables must not begin with a digit.
* Transpiled variable will have `$` appended to it in final `.wast` result.
* `$`, `@`, `_` are allowed.
* Variables must not contain [punctuations](./punctuation.md) or [operators](./operators.md).

