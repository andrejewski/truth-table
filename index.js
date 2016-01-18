
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

function astFromString(str) {
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  var output = parser.feed(str).results;
  if(!(output.length && output[0].length)) return null;
  return dearray(output[0]);
}

function dearray(ast) {
  if(Array.isArray(ast) && ast.length === 1) {
    var _ast = ast[0];
    _ast.left = dearray(_ast.left);
    _ast.right = dearray(_ast.right);
    return _ast;
  }
  return ast;
}

function nodeList(ast) {
  var list = [];
  (function _nodeList(ast) {
    list.push(ast);
    if(ast.type === 'atom') return;
    if(ast.left) _nodeList(ast.left);
    if(ast.right) _nodeList(ast.right);
  })(ast);
  return list;
}

function boolMatrix(n) {
  var mat = [];
  (function _boolMatrix(set, c) {
    if(!c) return mat.push(set);
    _boolMatrix(set.concat(true), c - 1);
    _boolMatrix(set.concat(false), c - 1);
  })([], n);
  return mat;
}

function unique(list, next) {
  if(list.map(ast.print).indexOf(ast.print(next)) === -1) {
    list.push(next);
  }
  return list;
}

function alphabetical(a, b) {
  var at = ast.print(a);
  var bt = ast.print(b);
  var lx = at.length - bt.length;
  if(!lx) return at.localeCompare(bt);
  return lx;
}

var Ast = ast;

function tableFromAst(ast) {
  var nodes = nodeList(ast);
  var atomics = nodes.filter(function(node) {
    return node.type == 'atom';
  }).reduce(unique, []).sort(alphabetical);
  var complex = nodes.filter(function(node) {
    return node.type != 'atom';
  }).reduce(unique, []).sort(alphabetical);
  
  var bools = boolMatrix(atomics.length);
  var atomSets = [];
  var rowN = bools.length;
  var colN = bools[0].length;
  for(var i = 0; i < rowN; i++) {
    var set = {};
    for(var j = 0; j < colN; j++) {
      set[atomics[j].left] = bools[i][j];
    }
    atomSets.push(set);
  }

  var combos = complex.reduce(function(table, prop, index) {
    table.push(atomSets.map(function(atomSet) {
      return Ast.evaluate(prop, atomSet);
    }));
    return table;
  }, []);

  var table = combos.reduce(function(table, row) {
    row.forEach(function(bool, j) {
      table[j].push(bool);
    });
    return table;
  }, bools);

  return {
    head: atomics.concat(complex),
    body: table,
  };
}

function tag(name, content) {
  if(Array.isArray(content)) content = content.join('');
  return "<"+name+">"+content+"</"+name+">";
}

function boolCell(bool) {
  var className = bool ? 'cell-true' : 'cell-false';
  var text = bool ? 'True' : 'False';
  return "<td class='"+className+"'>"+text+"</td>";
}

function range(from, to) {
  var step = (to - from) / Math.abs(to - from);
  var arr = [];
  while(from !== to) {
    arr.push(from);
   from += step; 
  }
  return arr;
}

function htmlFromTable(table) {
  var tHead = tag('thead', tag('tr', table.head.map(function(node) {
    return tag('th', escapeHtml(ast.print(node)));
  })));
  var tBody = tag('tbody', range(0, table.body.length).map(function(i) {
    return tag('tr', range(0, table.body[0].length).map(function(j) {
      return boolCell(table.body[i][j]);
    }));
  }));
  return tag('table', [tHead, tBody]);
}

var $input = document.getElementById('input');
var $table = document.getElementById('table');
var $guide = document.getElementById('guide');

$input.onkeyup = function() {
  if(!$input.value.length) {
    $table.classList.add('hidden');
    $guide.classList.remove('hidden');
    return;
  } else {
    $guide.classList.add('hidden');
    $table.classList.remove('hidden');
  }
  var ast = astFromString($input.value);
  if(!ast) return;
  $table.innerHTML = htmlFromTable(tableFromAst(ast));
}

