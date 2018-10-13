/**
 * Get API docs mega-list
 *
 * This is an example of how to generate a page with documentjs query
 * It will eventually be seversal pages that link to each other (built in gatsby-node)
 */
import React from 'react'
import { graphql } from 'gatsby'

import Page from '../components/LayoutBasic'

const APIPage = ({ data: { allDocumentationJs: { edges } } }) => {
  const docs = edges.map(e => e.node)
  // alphabatize by name
  docs.sort((a, b) => ((a.name > b.name) ? 1 : ((b.name > a.name)) ? -1 : 0))
  return (
    <Page>
      <div id='api'>
        <section className='content'>
          <h2>API</h2>
          {docs.map(({ name, kind, returns, params, examples, description: { childMarkdownRemark: { html } } }, di) => (
            <article key={di}>
              <h3>{name}</h3>
              <div dangerouslySetInnerHTML={{ __html: html }} />
              {!!returns.length && <div>returns {returns[0].type.name}</div>}
              {!!params.length && (
                <div className='parameters'>
                  <h4>Parameters</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {params.map((param, pi) => (
                        <tr key={pi}>
                          <td>{param.name}</td>
                          <td>{param.type && param.type.name ? param.type.name : 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {examples && !!examples.length && (
                <div className="examples">
                  <h4>Example{examples.length > 1 && <span>s</span>}</h4>
                  {examples.map(({ highlighted }) => (<pre dangerouslySetInnerHTML={{ __html: highlighted }}></pre>))}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </Page>
  )
}

export default APIPage

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
`
