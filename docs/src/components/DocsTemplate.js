/**
 * See ../../gatsby-node.js
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Page from './LayoutBasic';
import { renderAst } from '../render-ast';

function DocsTemplate({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, htmlAst } = markdownRemark;
  return (
    <Page title={frontmatter.title}>
      <section className="Content Content--prose">{renderAst(htmlAst)}</section>
    </Page>
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
