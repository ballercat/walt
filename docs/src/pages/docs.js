/**
 * List all markdown pages that are not "/"
 *
 * This is a demo-lister, and eventually will probly be a markdown document that is hand-edited.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Layout from '../components/LayoutBasic';
import TableOfContents from '../components/toc';
import { renderAst } from '../render-ast';

const DocsPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const pages = [
    ...edges
      .filter(e => e.node.frontmatter.path && e.node.frontmatter.path !== '/')
      .map(e => ({
        ...e.node.frontmatter,
        id: e.node.id,
        htmlAst: e.node.htmlAst,
      })),
    { id: '-1', title: 'Reference', path: '/api' },
  ];

  return (
    <Layout>
      <div id="docs" className="Api">
        <TableOfContents pages={pages} title="Pages" />
        <section className="Content Content--prose">
          {renderAst(pages[0].htmlAst)}
        </section>
      </div>
    </Layout>
  );
};

DocsPage.propTypes = {
  data: PropTypes.object,
};

export default DocsPage;

export const pageQuery = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          id
          htmlAst
          frontmatter {
            title
            path
          }
        }
      }
    }
  }
`;
