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
    FOR _ LB _ LoopArgument  _ SEPARATOR _ Expression _ SEPARATOR _ LoopArgument _ RB _ BranchBody
    {% forLoop %}

LoopArgument ->
    Expression           {% id %}
  | AssignmentExpression {% id %}

While ->
    WHILE _ LB _ Expression _ RB _ BranchBody {% whileLoop %}

Break -> BREAK _ SEPARATOR {% node(Syntax.Break) %}
