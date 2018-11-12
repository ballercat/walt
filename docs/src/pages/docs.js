/**
 * List all markdown pages that are not "/"
 *
 * This is a demo-lister, and eventually will probly be a markdown document that is hand-edited.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import Layout from '../components/LayoutBasic';

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
        filePath: e.node.fileAbsolutePath.split('/').slice(-1)[0],
      })),
    { id: '-1', title: 'Reference', path: '/api', filePath: '9999_api.md' },
  ].sort((a, b) => {
    const aPath = a.filePath.toUpperCase();
    const bPath = b.filePath.toUpperCase();
    if (aPath > bPath) {
      return 1;
    }
    if (aPath < bPath) {
      return -1;
    }
    return 0;
  });

  return (
    <Layout title="Documentation">
      <Layout.Content className="Documentation Documentation--landing">
        <h1>Documentation</h1>
        <div className="Documentation-intro">
          Below you will find the documentation for Walt WebAssembly Syntax.
          This documentation is still a work in progress, if you see issues or
          would like to see missing information, please open an issue{' '}
          <a href="">on the GitHub repository</a>
        </div>
        <div className="Documentation-overview">
          <ul>
            {pages.map(page => (
              <li key={page.title}>
                {page.isNative ? (
                  <a href={page.path}>{page.title}</a>
                ) : (
                  <Link to={page.path} title={page.title}>
                    {page.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Layout.Content>
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
          fileAbsolutePath
          frontmatter {
            title
            path
          }
        }
      }
    }
  }
`;
