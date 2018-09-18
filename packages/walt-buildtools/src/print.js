// Print nodes like JSX elements
"use strict";

function getValue(node) {
  if (typeof value !== 'string') {
    return node.value;
  }
  if (node.value.length < 60) {
    return node.value;
  }

  return node.value.slice(0,60) + "...";
}

function print(node) {
  if (!node.params.length) {
    return `<${node.Type} value="${getValue(node)}" type=${JSON.stringify(node.type)} />`
  }

  return `<${node.Type} value="${getValue(node)}" type=${JSON.stringify(node.type)} >

${node.params.filter(Boolean).map(child => {
  const childStr = print(child);
  return childStr.split("\n").map(s => "  " + s).join("\n");
}).join("\n")}

</${node.Type}>`;

};

module.exports = print;
