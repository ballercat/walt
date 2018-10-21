import React, { Fragment } from 'react';
import 'prismjs/themes/prism.css';

import Header from './Header';

import '../scss/main.scss';

const LayoutBasic = ({ children, landing, title }) => (
  <Fragment>
    <Header title={title} landing={landing} />
    <main className={landing ? 'Landing' : ''}>{children}</main>
  </Fragment>
);

export default LayoutBasic;
