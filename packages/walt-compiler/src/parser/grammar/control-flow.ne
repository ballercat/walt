# If then else .. if
If ->
    IF _ LB _ Expression _ RB _ BranchBody        {% node(Syntax.IfThenElse) %}
  | IF _ LB _ Expression _ RB _ BranchBody _ Else {% node(Syntax.IfThenElse) %}

Else ->
    ELSE _ BranchBody {% node(Syntax.Else) %}
BranchBody ->
    Statement {% id %}
  | Block     {% id %}

For ->
  FOR _ LB _ ForArg  _ SEPARATOR _ Expression _ SEPARATOR _ ForArg _ RB _ BranchBody
  {% forLoop %}

# Statements inside for loop are intentionally a subset of valid expressions
# Missing is the ability to use an assignment-expression. If not omitted it would
# result in ambigious syntax expressions vs statement assignment (which have
# different semantics)
ForArg ->
    _Assignment {% id %}
  | Ternary     {% id %}

While -> WHILE _ LB _ Expression _ RB _ BranchBody {% whileLoop %}

Break -> BREAK _ SEPARATOR {% node(Syntax.Break) %}
