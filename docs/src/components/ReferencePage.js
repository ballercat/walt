import React from 'react';
import Layout from './LayoutBasic';

const ReferencePage = props => {
  return (
    <Layout>
      <div id="docs" className="Api">
        <section className="content">{props.children}</section>
      </div>
    </Layout>
  );
};

export default ReferencePage;
