
function Node(type, sym, left, right) {
  return {
    type: type,
    sym: sym,
    left: left,
    right: right 
  };
}

var precedence = [
  'not',
  'and',
  'or',
  'xor',
  'imply',
  'iff',
];

var operations = {
  not: function(x) { return !x; },
  and: function(x, y) { return x && y; },
  or:  function(x, y) { return x || y; },
  xor: function(x, y) { return (x || y) && !(x && y); },
  imply: function(x, y) { return !x || y; },
  iff: function(x, y) { return x === y; },
};

function evaluate(ast, atomValues) {
  if(typeof ast !== 'object') return ast;
  return (ast.type === 'atom')
    ? atomValues[ast.left]
    : operations[ast.type](
        evaluate(ast.left, atomValues), 
        evaluate(ast.right, atomValues));
}

function print(ast, parent) {
  if(typeof parent !== 'object') parent = null;
  var text = ast.right
    ? print(ast.left, ast) + " " + ast.sym + " " + print(ast.right, ast)
    : ast.type === 'atom'
      ? ast.left
      : ast.sym + " " + print(ast.left, ast);
  if(parent && precedence.indexOf(ast.type) > precedence.indexOf(parent.type)) {
    text = "(" + text + ")";
  }
  return text;
}

var ast = {};

ast.Not = Node.bind(null, 'not');
ast.And = Node.bind(null, 'and');
ast.Or = Node.bind(null, 'or');
ast.Xor = Node.bind(null, 'xor');
ast.Imply = Node.bind(null, 'imply');
ast.Iff = Node.bind(null, 'iff');
ast.Atom = Node.bind(null, 'atom');

ast.evaluate = evaluate;
ast.print = print;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
   module.exports = ast;
} else {
   window.ast = ast;
}

