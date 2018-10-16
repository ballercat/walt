import React from 'react'
import { graphql } from 'gatsby'
import RehypeReact from 'rehype-react'

import Page from '../components/LayoutBasic'
import WhatAnimation from '../components/WhatAnimation'

const renderAst = new RehypeReact({
  createElement: React.createElement,
  components: { 'what-animation': WhatAnimation, 'footer': 'footer' }
}).Compiler

const IndexPage = ({ data: { markdownRemark: { htmlAst } } }) => (
  <Page landing>
    <section className='content' children={renderAst(htmlAst)} />
  </Page>
)

export const pageQuery = graphql`
query LandingPage {
  markdownRemark(frontmatter:{ path: { eq: "/" } }) {
    htmlAst
  }
}
`

export default IndexPage
