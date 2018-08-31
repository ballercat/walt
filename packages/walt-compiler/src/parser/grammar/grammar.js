// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

// helpers
const Syntax = require('walt-syntax');

const nth = n => d => d[n];
const nuller = () => null;
const nonEmpty = d => {
  return Array.isArray(d) ? !!d.length : d != null;
};
const add = d => `${d[0]}${d[1]}`;

// Node Types
const node = Type => d => ({
  Type,
  value: '',
  meta: [],
  params: d.filter(nonEmpty)
});

const binary = (d) => {
  const [lhs, operator, rhs] = d.filter(nonEmpty);
  return {
    Type: 'BinaryExpression',
    value: operator,
    meta: [],
    params: [lhs, rhs]
  };
};

const constant = d => ({
  Type: 'Constant',
  value: d[0],
  meta: [],
  params: []
});

const identifier = d => ({
  Type: 'Identifier',
  value: d.join(''),
  meta: [],
  params: []
});

const statement = d => {
  return d.filter(nonEmpty);
};

const unary = ([operator, target]) => {
  return {
    Type: 'UnaryExpression',
    value: operator,
    meta: [],
    params: [target]
  };
};

const ternary = d => {
  return {
    Type: "TernaryExpression",
    value: "?",
    meta: [],
    params: d.filter(t => nonEmpty(t) && t !== "?" && t !== ":")
  };
};

const assignment = (d) => {
  const [lhs, operator, rhs] = d.filter(nonEmpty);
  return {
    Type: "Assignment",
    value: operator,
    meta: [],
    params: [lhs, rhs]
  };
};

const memory_assignment = d => {
  const [lhs, offset, operator, rhs] = d.filter(t => nonEmpty(t) && !["[", "]"].includes(t));
  return {
    Type: "MemoryAssignment",
    value: operator,
    params: [lhs, offset, rhs]
  };
};

const subscript = d => {
  const [identifier, field] = d.filter(t => nonEmpty(t) && !['[', ']', '.'].includes(t));
  return {
    Type: "ArraySubscript",
    value: identifier.value,
    meta: [],
    params: [identifier, field]
  };
};

const fun = d => {
  const [name, args, result, block] = d.filter(nonEmpty);
  return {
    ...name,
    Type: Syntax.FunctionDeclaration,
    meta: [],
    params: [args, result, block]
  };
};

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "Program$ebnf$1", "symbols": []},
    {"name": "Program$ebnf$1", "symbols": ["Program$ebnf$1", "_SourceElement"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Program", "symbols": ["Program$ebnf$1", "_"], "postprocess": d => ({ Type: 'Program', params: d[0] })},
    {"name": "_SourceElement", "symbols": ["_", "SourceElement"], "postprocess": nth(1)},
    {"name": "SourceElement", "symbols": ["Function"], "postprocess": id},
    {"name": "SourceElement", "symbols": ["Statement"], "postprocess": id},
    {"name": "Statement", "symbols": ["ExpressionStatement"], "postprocess": id},
    {"name": "Statement", "symbols": ["Declaration"], "postprocess": id},
    {"name": "Statement", "symbols": ["ImmutableDeclaration"], "postprocess": id},
    {"name": "_Statement", "symbols": ["_", "Statement"], "postprocess": nth(1)},
    {"name": "Block", "symbols": ["_Block"], "postprocess": d => node(Syntax.Block)(d[0])},
    {"name": "_Block$ebnf$1", "symbols": []},
    {"name": "_Block$ebnf$1", "symbols": ["_Block$ebnf$1", "_Statement"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_Block", "symbols": ["LCB", "_Block$ebnf$1", "_", "RCB"], "postprocess": nth(1)},
    {"name": "Function", "symbols": ["FUNCTION", "__", "Identifier", "_", "FunctionParameters", "_", "FunctionResult", "_", "Block"], "postprocess": fun},
    {"name": "FunctionParameters$ebnf$1", "symbols": ["ParameterList"], "postprocess": id},
    {"name": "FunctionParameters$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionParameters", "symbols": ["LB", "_", "FunctionParameters$ebnf$1", "_", "RB"], "postprocess": node(Syntax.FunctionArguments)},
    {"name": "ParameterList$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "Pair"]},
    {"name": "ParameterList$ebnf$1", "symbols": ["ParameterList$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "ParameterList$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ParameterList", "symbols": ["Pair", "ParameterList$ebnf$1"], "postprocess": id},
    {"name": "FunctionResult$ebnf$1$subexpression$1", "symbols": ["COLON", "_", "Identifier"], "postprocess": nth(2)},
    {"name": "FunctionResult$ebnf$1", "symbols": ["FunctionResult$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "FunctionResult$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionResult", "symbols": ["FunctionResult$ebnf$1"], "postprocess": node(Syntax.FunctionResult)},
    {"name": "Declaration$subexpression$1", "symbols": [{"literal":"="}], "postprocess": nuller},
    {"name": "Declaration", "symbols": ["LET", "_", "Pair", "_", "Declaration$subexpression$1", "_", "ExpressionStatement"], "postprocess": node(Syntax.Declaration)},
    {"name": "ImmutableDeclaration$subexpression$1", "symbols": [{"literal":"="}], "postprocess": nuller},
    {"name": "ImmutableDeclaration", "symbols": ["CONST", "_", "Pair", "_", "ImmutableDeclaration$subexpression$1", "_", "ExpressionStatement"], "postprocess": node(Syntax.ImmutableDeclaration)},
    {"name": "Pair", "symbols": ["Identifier", "_", "COLON", "_", "Identifier"], "postprocess": node(Syntax.Pair)},
    {"name": "ExpressionStatement", "symbols": ["Expression", "SEPARATOR"], "postprocess": id},
    {"name": "Expression", "symbols": ["Assignment"], "postprocess": id},
    {"name": "Assignment", "symbols": ["Identifier", "_", {"literal":"="}, "_", "Ternary"], "postprocess": assignment},
    {"name": "Assignment", "symbols": ["Identifier", {"literal":"["}, "Expression", {"literal":"]"}, "_", {"literal":"="}, "_", "Ternary"], "postprocess": memory_assignment},
    {"name": "Assignment", "symbols": ["Ternary"], "postprocess": id},
    {"name": "Ternary", "symbols": ["Ternary", "_", {"literal":"?"}, "_", "Ternary", "_", {"literal":":"}, "_", "Ternary"], "postprocess": ternary},
    {"name": "Ternary", "symbols": ["Binary"], "postprocess": id},
    {"name": "Binary", "symbols": ["Logical"], "postprocess": id},
    {"name": "Logical$string$1", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Logical", "symbols": ["Logical", "_", "Logical$string$1", "_", "Bitwise"], "postprocess": binary},
    {"name": "Logical$string$2", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Logical", "symbols": ["Logical", "_", "Logical$string$2", "_", "Bitwise"], "postprocess": binary},
    {"name": "Logical", "symbols": ["Bitwise"], "postprocess": id},
    {"name": "Bitwise", "symbols": ["Bitwise", "_", {"literal":"|"}, "_", "Sum"], "postprocess": binary},
    {"name": "Bitwise", "symbols": ["Bitwise", "_", {"literal":"^"}, "_", "Sum"], "postprocess": binary},
    {"name": "Bitwise", "symbols": ["Bitwise", "_", {"literal":"&"}, "_", "Sum"], "postprocess": binary},
    {"name": "Bitwise", "symbols": ["Equality"], "postprocess": id},
    {"name": "Equality$string$1", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Equality", "symbols": ["Equality", "_", "Equality$string$1", "_", "Comparison"], "postprocess": binary},
    {"name": "Equality$string$2", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Equality", "symbols": ["Equality", "_", "Equality$string$2", "_", "Comparison"], "postprocess": binary},
    {"name": "Equality", "symbols": ["Comparison"], "postprocess": id},
    {"name": "Comparison", "symbols": ["Comparison", "_", {"literal":"<"}, "_", "Shift"], "postprocess": binary},
    {"name": "Comparison", "symbols": ["Comparison", "_", {"literal":">"}, "_", "Shift"], "postprocess": binary},
    {"name": "Comparison$string$1", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison", "symbols": ["Comparison", "_", "Comparison$string$1", "_", "Shift"], "postprocess": binary},
    {"name": "Comparison$string$2", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison", "symbols": ["Comparison", "_", "Comparison$string$2", "_", "Shift"], "postprocess": binary},
    {"name": "Comparison", "symbols": ["Shift"], "postprocess": id},
    {"name": "Shift$string$1", "symbols": [{"literal":">"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Shift", "symbols": ["Shift", "_", "Shift$string$1", "_", "Sum"], "postprocess": binary},
    {"name": "Shift$string$2", "symbols": [{"literal":"<"}, {"literal":"<"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Shift", "symbols": ["Shift", "_", "Shift$string$2", "_", "Sum"], "postprocess": binary},
    {"name": "Shift$string$3", "symbols": [{"literal":">"}, {"literal":">"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Shift", "symbols": ["Shift", "_", "Shift$string$3", "_", "Sum"], "postprocess": binary},
    {"name": "Shift", "symbols": ["Sum"], "postprocess": id},
    {"name": "Sum", "symbols": ["Sum", "_", {"literal":"+"}, "_", "Product"], "postprocess": binary},
    {"name": "Sum", "symbols": ["Sum", "_", {"literal":"-"}, "_", "Product"], "postprocess": binary},
    {"name": "Sum", "symbols": ["Product"], "postprocess": id},
    {"name": "Product", "symbols": ["Product", "_", {"literal":"*"}, "_", "Unary"], "postprocess": binary},
    {"name": "Product", "symbols": ["Product", "_", {"literal":"/"}, "_", "Unary"], "postprocess": binary},
    {"name": "Product", "symbols": ["Product", "_", {"literal":"%"}, "_", "Unary"], "postprocess": binary},
    {"name": "Product", "symbols": ["Unary"], "postprocess": id},
    {"name": "Unary", "symbols": [{"literal":"!"}, "Access"], "postprocess": unary},
    {"name": "Unary", "symbols": [{"literal":"~"}, "Access"], "postprocess": unary},
    {"name": "Unary", "symbols": [{"literal":"-"}, "Access"], "postprocess": unary},
    {"name": "Unary", "symbols": [{"literal":"+"}, "Access"], "postprocess": unary},
    {"name": "Unary$string$1", "symbols": [{"literal":"+"}, {"literal":"+"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Unary", "symbols": ["Unary$string$1", "Access"], "postprocess": unary},
    {"name": "Unary$string$2", "symbols": [{"literal":"-"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Unary", "symbols": ["Unary$string$2", "Access"], "postprocess": unary},
    {"name": "Unary", "symbols": ["Access"], "postprocess": id},
    {"name": "Access", "symbols": ["Identifier", "DOT", "Identifier"], "postprocess": subscript},
    {"name": "Access", "symbols": ["Identifier", "LSB", "_", "Expression", "_", "RSB"], "postprocess": subscript},
    {"name": "Access", "symbols": ["Atom"], "postprocess": id},
    {"name": "Atom", "symbols": ["Identifier"], "postprocess": id},
    {"name": "Atom", "symbols": ["Number"], "postprocess": id},
    {"name": "Identifier", "symbols": ["word"], "postprocess": identifier},
    {"name": "Number", "symbols": ["digit"], "postprocess": constant},
    {"name": "word", "symbols": [/[a-zA-Z_]/], "postprocess": id},
    {"name": "word", "symbols": ["word", /[a-zA-Z0-9_]/], "postprocess": add},
    {"name": "digit", "symbols": [/[0-9]/], "postprocess": id},
    {"name": "digit", "symbols": ["digit", /[0-9]/], "postprocess": add},
    {"name": "SEPARATOR", "symbols": ["_", {"literal":";"}], "postprocess": nuller},
    {"name": "FUNCTION$string$1", "symbols": [{"literal":"f"}, {"literal":"u"}, {"literal":"n"}, {"literal":"c"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "FUNCTION", "symbols": ["FUNCTION$string$1"], "postprocess": nuller},
    {"name": "DOT", "symbols": [{"literal":"."}], "postprocess": nuller},
    {"name": "LB", "symbols": [{"literal":"("}], "postprocess": nuller},
    {"name": "RB", "symbols": [{"literal":")"}], "postprocess": nuller},
    {"name": "LSB", "symbols": [{"literal":"["}], "postprocess": nuller},
    {"name": "RSB", "symbols": [{"literal":"]"}], "postprocess": nuller},
    {"name": "LCB", "symbols": [{"literal":"{"}], "postprocess": nuller},
    {"name": "RCB", "symbols": [{"literal":"}"}], "postprocess": nuller},
    {"name": "COLON", "symbols": [{"literal":":"}], "postprocess": nuller},
    {"name": "LET$string$1", "symbols": [{"literal":"l"}, {"literal":"e"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LET", "symbols": ["LET$string$1"], "postprocess": nuller},
    {"name": "CONST$string$1", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"n"}, {"literal":"s"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "CONST", "symbols": ["CONST$string$1"], "postprocess": nuller}
]
  , ParserStart: "Program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
