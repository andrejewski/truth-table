
var logicalRegex = /&&|(\|\|)/g;

function unwrap(str) {
	str = str.trim();
	if(str.charAt(0) === '(' && str.charAt(str.length - 1) === ')') {
		str = str.slice(1, str.length - 1);
	}
	return str.trim();
}

function tokenize(buf) {
	var token;
	var tokens = [];
	while(token = nextToken(buf)) {
		tokens.push(token);
		buf = buf.slice(token.length).trim();
		// console.log('buf =', buf, buf.length);
	}
	if(!(tokens.length % 2)) {
		throw new Error('Uneven amount of expresions.');
	}
	return tokens;
}

function nextToken(str) {
	if(!str.search(logicalRegex)) return str.slice(0,2);

	var space = str.search(logicalRegex);
	var paren = str.indexOf('(');
	
	if(!paren) return str.substring(0, indexOfCloseParen(str) + 1);
	if(!~space) return str;
	if(~paren && paren < space) {
		return str.substring(0, indexOfCloseParen(str) + 1);
	} else if (~space) {
		return str.slice(0, space).trim();
	}
}

function indexOfCloseParen(str) {
	var start = str.indexOf('(') + 1;
	if(!start) return -1;
	var depth = 1;
	for(var i = start; i < str.length; i++) {
		var c = str.charAt(i);
		if(c == '(') depth++;
		if(c == ')') depth--;
		if(!depth) return i;
	}
	throw new Error('Unmatched parens', str);
}

function parse(str) {
	str = unwrap(str);
	var tokens = tokenize(str);

	if(tokens.length === 1) {
		var token = tokens.pop();
		if(token.charAt(0) === '!') {
			return {
				operator: 'NOT',
				left: parse(token.slice(1)),
				right: {variable: null}
			};
		}
		if(!~str.search(logicalRegex)) {
			return {variable: token};
		}
	}

	var right = tokens.pop()
	var op = tokens.pop();
	var left = tokens.join(' ');

	if(op == '||') op = 'OR';
	if(op == '&&') op = 'AND';

	return {
		operator: op,
		left: parse(left),
		right: parse(right)
	};
}

var ops = {
	'AND': function(a,b) {return a && b;},
	'OR':  function(a,b) {return a || b;},
	'NOT': function(x) {return !x;}
}

function table(strs) {
	var datum = strs.map(parse);
	var switches = datum.reduce(function(list, obj) {
		uniqVars(obj).forEach(function(v) {
			if(!~list.indexOf(v)) list.push(v);
		});
		return list;
	}, []);
	var colNames = switches.concat(strs);
	var booleans = perm(switches.length);

	datum.forEach(function(obj) {
		booleans.map(function(bools, row) {
			var dict = bools.reduce(function(obj, val, index) {
				obj[switches[index]] = val;
				return obj;
			}, {});
			return evaluate(obj, dict);
		}).forEach(function(result, index) {
			booleans[index].push(result);
		});
	});
	
	return [colNames].concat(booleans);
}

function uniqVars(root) {
	var vars = [];
	(function walk(node) {
		if(node.operator === 'NOT') {
			walk(node.left);
		} else if(node.variable && vars.indexOf(node.variable) === -1) {
			vars.push(node.variable);
		} else {
			walk(node.left);
			walk(node.right);
		}
	})(root);
	return vars;
}

function evaluate(root, dict) {
	return (function reduce(node) {
		if(node.variable) return dict[node.variable];
		if(node.operator === 'NOT') {
			return ops.NOT(reduce(node.left));
		}
		var a = reduce(node.left);
		var b = reduce(node.right);
		return ops[node.operator](a, b);
	})(root);
}

function perm(width) {
	var length = Math.pow(2, width);

	var m = [];
	for(var i = 0; i < length; i++) {
		m[i] = pad(width, i.toString(2)).split('').map(function(c) {
			return c == '1';
		});
	}
	return m.reverse();

	function pad(len, str) {
		if(str.length === len) return str;
		return pad(len, '0' + str);
	}
}

var condEl = document.getElementById('condition');
var tableEl = document.getElementById('table');

condEl.onkeyup = input;
input();

function input() {
	var text = condEl.value;
	if(!text) return;
	try {
		var truth = table(text.split(';'));
		print(truth);
	} catch(e) {
		console.log(e);
	}
}

function print(matrix) {
	var rows = matrix.length;
	var cols = matrix[0].length;
	var html = "";
	var line = "";

	html += '<tr>';
	for(var i = 0; i < cols; i++) {
		html += "<th>"+matrix[0][i]+"</th>";
	}
	html += '</tr>';

	for(var r = 1; r < rows; r++) {
		line = '<tr>';
		for(var c = 0; c < cols; c++) {
			var b = matrix[r][c];
			line += "<td class='cell-"+b+"'>"+b+"</td>";
		}
		html += line + '</tr>';
	}

	tableEl.innerHTML = html;
}
