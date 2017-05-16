# Variables

## Naming

* Variables do not need to start with `$`.
* Variables must not begin with a digit.
* Transpiled wast variable will have `$` appended to it.
* `$`, `@`, `_` are allowed.
* Variables must not contain [punctuations](./punctuation.md) or [operators](./operators.md).

## Declarations

Each variable declaration must begin with either:

* `const` keyword, indicating a constant variable
* `global` keyword, indicating a global variable
  * `global` declarations can only be made at [global scope](./scope.md#global)

