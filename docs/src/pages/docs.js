/**
 * List all markdown pages that are not "/"
 */
import React from 'react'
import { Link, graphql } from 'gatsby'

import Page from '../components/LayoutBasic'

const DocsPage = ({ data: { allMarkdownRemark: { edges } } }) => {
  const pages = edges ? edges
    .filter(e => e.node.frontmatter.path && e.node.frontmatter.path !== '/')
    .map(e => ({ ...e.node.frontmatter, id: e.node.id })) : []
  return (
    <Page>
      <div id='docs'>
        <section className='content'>
          <h2>Index</h2>
          <ul>
            {
              pages.map(({ title, path, id }) => (
                <li key={id} >
                  <Link to={path} title={title}>{title}</Link>
                </li>
              ))
            }
          </ul>
        </section>
      </div>
    </Page>
  )
}

export default DocsPage

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
`
