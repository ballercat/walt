import React from 'react';
import RehypeReact from 'rehype-react';

// We need to do some creative use of react to attach name attributes to all of
// our headers.
const header = type => ({ children }) => {
  const child = React.Children.toArray(children)[0];
  if (typeof child !== 'string') {
    return React.cloneElement(type, { children });
  }
  return React.cloneElement(type, {
    name: child.toLowerCase().replace(/\s/g, '-'),
    children,
  });
};

export const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    h1: header(<h1 />),
    h2: header(<h2 />),
    h3: header(<h3 />),
  },
}).Compiler;
