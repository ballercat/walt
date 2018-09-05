# If then else .. if
If ->
    IF _ LB _ Expression _ RB _ BranchBody        {% node(Syntax.IfThenElse) %}
  | IF _ LB _ Expression _ RB _ BranchBody _ Else {% node(Syntax.IfThenElse) %}

Else ->
    ELSE _ BranchBody {% node(Syntax.Else) %}
BranchBody ->
    Statement {% id %}
  | Block     {% id %}
