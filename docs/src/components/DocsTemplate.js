/**
 * See ../../gatsby-node.js
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Layout from './LayoutBasic';
import { renderAst } from '../render-ast';

function DocsTemplate({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, htmlAst } = markdownRemark;
  return (
    <Layout title={frontmatter.title}>
      <Layout.Content className="Documentation">
        <section className="Content Content--prose">
          {renderAst(htmlAst)}
        </section>
      </Layout.Content>
    </Layout>
  );
}

DocsTemplate.propTypes = {
  data: PropTypes.object.isRequired,
};

export default DocsTemplate;
export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      htmlAst
      frontmatter {
        path
        title
      }
    }
  }
`;
