/**
 * Get API docs mega-list
 *
 * This is an example of how to generate a page with documentjs query
 * It will eventually be seversal pages that link to each other (built in gatsby-node)
 */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Interface from '../components/Interface';
import Page from '../components/LayoutBasic';

const normalize = ({
  node: { description = { childMarkdownRemark: { html: '' } }, ...rest },
}) => {
  return {
    name: rest.name,
    examples: rest.examples.map((example, i) => ({
      what: i,
      html: example.highlighted,
    })),
    parameters: rest.params.map(p => {
      return {
        ...p,
        type: (p.type && p.type.name) || 'any',
      };
    }),
    returns: rest.returns.length
      ? rest.returns.map(r => ({ type: r.type.name, name: r.name }))
      : [{ name: 'none', type: 'undefined' }],
    descriptionHTML: description.childMarkdownRemark.html,
  };
};
// alphabatize by name
const byName = (a, b) => {
  if (a.name > b.name) {
    return 1;
  }
  if (b.name > a.name) {
    return -1;
  }
  return 0;
};

const APIPage = ({
  data: {
    allDocumentationJs: { edges },
  },
}) => {
  const apis = edges.map(normalize).sort(byName);
  return (
    <Page>
      <div id="api">
        <section className="content">
          <h2>API Reference</h2>
          {apis.map(api => (
            <Interface
              key={api.name}
              name={api.name}
              returns={api.returns}
              parameters={api.parameters}
              examples={api.examples}
              descriptionHTML={api.descriptionHTML}
            />
          ))}
        </section>
      </div>
    </Page>
  );
};

APIPage.propTypes = {
  data: PropTypes.object.isRequired,
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
