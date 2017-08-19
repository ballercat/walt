_stmt_ -> `let` **id** `;`

_stmt_ -> `let` **id** `=` _expr_ `;`

_stmt_ -> `const` **id** `=` _expr_ `;`

_stmt_ -> `export` _stmt_ `;`

_stmt_ -> `import` `{` **id** `:` _typedef_ `}` `from` _string_ `;`

_stmt_ -> `if` `(` _expr_ `)` _stmt_

_stmt_ -> `if` `(` _expr_ `)` _stmt_ `else` _stmt_

_stmt_ -> `while` `(` _expr_ `)` _stmt_

_stmt_ -> `do` _stmt_ `while` `(` _expr_ `)`

_stmt_ -> `function` **id** `(` _arglist_ `)` `:` _returntype_ _stmt_

_returntype_ -> _type_ | `void`

_stmt_ -> `{` _stmts_ `}`

_stmts_ -> _stmts_ _stmt_ | _e_

_arglist_ -> _arglist_ _arg_ | _e_

_arg_ -> **id** `:` _type_ | _arg_ , _arg_

_type_ -> `i32` | `i64` | `f32` | `f64`

_typedef_ -> _type_ | `anyfunc`

_expr_ -> _expr_ `+` _term_

_expr_ -> _expr_ `-` _term_

_expr_ -> _term_

_expr_ -> **id** `(` _paramlist_ `)`

_paramlist_ -> _e_ | _paramlist_

_paramlist_ -> _param_ , _param_ | _param_

_pram_ -> **id** | _string_ | _expr_

_term_ -> _term_ `*` _factor_

_term_ -> _term_ `/` _factor_

_term_ -> _factor_

_factor_ -> `(`_expr_`)`

_factor_ -> _number_

_number_ -> _number_ _integer_

_number_ -> _number_ `.` _number_ | _number_ | _e_

_integer_ -> `0`|`1`|`2`|`3`|`4`|`5`|`6`|`7`|`8`|`9`

_string_ -> `'` _chars_ `'`

_chars_ -> _chars_ _char_ | _char_ | _e_

_char_ -> **UTF-8**


