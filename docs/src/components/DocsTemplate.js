import React from 'react'
import { graphql } from 'gatsby'

import Page from './LayoutBasic'

export default function DocsTemplate ({ data }) {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark
  return (
    <Page title={frontmatter.title}>
      <section className='content' dangerouslySetInnerHTML={{ __html: html }} />
    </Page>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
      }
    }
  }`
