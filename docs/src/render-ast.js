import React from 'react';
import RehypeReact from 'rehype-react';
import WhatAnimation from './components/WhatAnimation';

export const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: { 'what-animation': WhatAnimation, footer: 'footer' },
}).Compiler;
