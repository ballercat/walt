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
  return (
    <Page>
      <div id='api'>
        <section className='content'>
          <h2>API</h2>
          {docs.map(({ name, kind, returns, params, description: { childMarkdownRemark: { html } } }) => (
            <article>
              <h3>{name}</h3>
              <div dangerouslySetInnerHTML={{ __html: html }} />
              <div>
                {kind}
                {returns.length && <span>returns {returns[0].type.name}</span>}
              </div>
              <hr />
              {!!params.length && (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map(param => (
                      <tr>
                        <td />
                      </tr>
                    ))}
                  </tbody>
                </table>
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
  allDocumentationJs {
    edges {
      node {
        name
        kind
        returns { type { name} }
        params { name type {  name } }
        description {
          childMarkdownRemark { html }
        }
      }
    }
  }
}
`
