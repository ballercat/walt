import React from 'react';
import RehypeReact from 'rehype-react';
import { AnimatedLogo } from './components/animated-logo';

export const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: {
    'animated-logo': AnimatedLogo,
    footer: 'footer', // eslint-disable-line
  },
}).Compiler;
