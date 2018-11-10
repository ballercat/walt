/**
 * Common heder used in all layouts
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';
import facebookImage from '../images/facebook.jpg';
import favIcon from '../images/favicon.png';
import { Header } from './header';
// import waltImage from '../images/walt-black-170x.png';

const SITE_META = graphql`
  query SiteMeta {
    site {
      siteMetadata {
        title
        subtitle
        description
        github
      }
    }
  }
`;

const HeaderContainer = ({ title }) => (
  <StaticQuery
    query={SITE_META}
    render={data => (
      <Fragment>
        <Helmet
          title={title}
          titleTemplate={`%s - ${data.site.siteMetadata.title} - ${
            data.site.siteMetadata.subtitle
          }`}
          defaultTitle={`${data.site.siteMetadata.title} - ${
            data.site.siteMetadata.subtitle
          }`}
        >
          <html lang="en" />
          <meta
            name="description"
            content={data.site.siteMetadata.description}
          />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,700"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans|Titillium+Web"
            rel="stylesheet"
          />
          <meta property="og:image" content={facebookImage} />
          <link href={favIcon} rel="icon" type="image/png" />
        </Helmet>
        <Header />
      </Fragment>
    )}
  />
);

HeaderContainer.propTypes = {
  title: PropTypes.string.isRequired,
};

export default HeaderContainer;
