
@{% var ast = typeof window !== 'undefined' ? window.ast : require('./ast.js'); %}

main -> _ EXP _ {% function(d) { return d[1]; } %}

# Propositional Logic

NOT     -> "!" | "¬" | "not" | "NOT"

AND     -> "&" | "&&" | "Λ" | "and" | "AND"

OR      -> "+" | "||" | "∨" | "or"  | "OR"

XOR     -> "⊕" | "</>" | "xor" | "XOR"

IMPLY   -> "->" | "=>" | "if" | "IF"

IFF     -> "<->" | "<=>" | "iff" | "IFF"

EXP -> "(" _ EXP _ ")"        {% function(d) { return d[2]; } %}
  | X_IFF_Y
  | X_IMPLY_Y
  | X_XOR_Y
  | X_OR_Y
  | X_AND_Y
  | NOT_X
  | ATOM 

NOT_X -> NOT _ EXP            {% function(d) { return ast.Not(d[0], d[2]); } %}

X_AND_Y -> EXP _ AND _ EXP      {% function(d) { return ast.And(d[2], d[0], d[4]); } %}

X_OR_Y -> EXP _ OR _ EXP        {% function(d) { return ast.Or(d[2], d[0], d[4]); } %}

X_XOR_Y -> EXP _ XOR _ EXP      {% function(d) { return ast.Xor(d[2], d[0], d[4]); } %}

X_IMPLY_Y -> EXP _ IMPLY _ EXP  {% function(d) { return ast.Imply(d[2], d[0], d[4]); } %}

X_IFF_Y -> EXP _ IFF _ EXP      {% function(d) { return ast.Iff(d[2], d[0], d[4]); } %}

ATOM -> TEXT                    {% function(d) { return ast.Atom(null, d[0]); } %}

WORD -> [a-zA-Z]  {% id %}
  | WORD [a-zA-Z] {% function(d) {return d[0] + d[1];} %}

TEXT -> WORD      {% id %}
  | WORD _ WORD   {% function(d) {return d[0] + ' ' + d[2];} %} 

_ -> null     {% function(d) {return null; } %}
	| _ [\s]    {% function(d) {return null; } %}

