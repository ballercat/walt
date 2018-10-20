/**
 * Get API docs mega-list
 *
 * This is an example of how to generate a page with documentjs query
 * It will eventually be seversal pages that link to each other (built in gatsby-node)
 */
import React from 'react';
import { graphql } from 'gatsby';

import Page from '../components/LayoutBasic';

const normalize = ({
  node: { description = { childMarkdownRemark: { html: '' } }, ...rest },
}) => {
  console.log(rest);
  return {
    ...rest,
    returns: rest.returns.length ? rest.returns : [{ type: { name: 'void' } }],
    descriptionHTML: description.childMarkdownRemark.html,
  };
};
// alphabatize by name
const byName = (a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0);

const APIPage = ({
  data: {
    allDocumentationJs: { edges },
  },
}) => {
  const docs = edges.map(normalize).sort(byName);
  return (
    <Page>
      <div id="api">
        <section className="content">
          <h2>API Reference</h2>
          {docs.map(
            ({ name, kind, returns, params, examples, descriptionHTML }) => (
              <article key={name}>
                <h3>{name}</h3>
                <div dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
                <div className="parameters">
                  <h4>Parameters</h4>
                  <ul>
                    {params.map(param => (
                      <li key={param.name}>
                        {param.name}:{' '}
                        {param.type && param.type.name
                          ? param.type.name
                          : 'any'}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="returns">
                  <h4>Returns</h4>
                  <div>
                    <pre>{returns[0].type.name}</pre>
                  </div>
                </div>
                {examples &&
                  !!examples.length && (
                    <div className="examples">
                      <h4>
                        Example
                        {examples.length > 1 && <span>s</span>}
                      </h4>
                      {examples.map(({ highlighted }, ei) => (
                        <pre
                          key={ei}
                          dangerouslySetInnerHTML={{ __html: highlighted }}
                        />
                      ))}
                    </div>
                  )}
              </article>
            )
          )}
        </section>
      </div>
    </Page>
  );
};

export default APIPage;

export const pageQuery = graphql`
  query {
    allDocumentationJs(filter: { name: { ne: "Syntax" } }) {
      edges {
        node {
          examples {
            highlighted
          }
          name
          kind
          returns {
            type {
              type
              name
            }
          }
          params {
            name
            type {
              name
            }
          }
          description {
            childMarkdownRemark {
              html
            }
          }
        }
      }
    }
  }
`;
