/**
 * List all markdown pages that are not "/"
 *
 * This is a demo-lister, and eventually will probly be a markdown document that is hand-edited.
 */
import React from 'react';
import { Link, graphql } from 'gatsby';

import Page from '../components/LayoutBasic';

const DocsPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const pages = edges
    ? edges
        .filter(e => e.node.frontmatter.path && e.node.frontmatter.path !== '/')
        .map(e => ({ ...e.node.frontmatter, id: e.node.id }))
    : [];
  return (
    <Page>
      <div id="docs">
        <section className="Content Content--prose">
          <h2>Index</h2>
          <ul>
            <li>
              <Link to="/api" title="API Documentation">
                API
              </Link>
            </li>
            {pages.map(({ title, path, id }) => (
              <li key={id}>
                <Link to={path} title={title}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
};

export default DocsPage;

// TODO: add filter to query, instead of in component
export const pageQuery = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          id
          frontmatter {
            title
            path
          }
        }
      }
    }
  }
`;
