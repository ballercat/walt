import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import 'prismjs/themes/prism.css';
import '../scss/main.scss';
import Header from './header-container';

const Layout = ({ children, landing, title }) => (
  <Fragment>
    <Header title={title} landing={landing} />
    <div className="Root">{children}</div>
  </Fragment>
);
Layout.propTypes = {
  children: PropTypes.node,
  landing: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

function Content({ children, ...rest }) {
  return <main {...rest}>{children}</main>;
}
Content.propTypes = {
  children: PropTypes.node,
};
Layout.Content = Content;

export default Layout;
