import React from 'react';
import { graphql } from 'gatsby';
import Page from '../components/LayoutBasic';
import { renderAst } from '../render-ast';

const IndexPage = ({
  data: {
    markdownRemark: { htmlAst },
  },
}) => (
  <Page landing>
    <section className="content">{renderAst(htmlAst)} </section>
  </Page>
);

export const pageQuery = graphql`
  query LandingPage {
    markdownRemark(frontmatter: { path: { eq: "/" } }) {
      htmlAst
    }
  }
`;

export default IndexPage;
