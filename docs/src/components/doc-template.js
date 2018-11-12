/**
 * See ../../gatsby-node.js
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Layout from './LayoutBasic';
import TableOfContents from './toc';
import { renderAst } from '../render-ast';

function DocsTemplate({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, htmlAst, headings } = markdownRemark;

  return (
    <Layout title={frontmatter.title}>
      <Layout.Content className="Documentation">
        <TableOfContents
          pages={headings.map(({ value }) => ({
            path: '#' + value.toLowerCase().replace(/\s/g, '-'),
            title: value,
            id: value,
            isNative: true,
          }))}
        />
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
      headings {
        value
      }
      frontmatter {
        path
        title
      }
    }
  }
`;
