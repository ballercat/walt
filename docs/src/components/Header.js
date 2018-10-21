/**
 * Common heder used in all layouts
 */

import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql, Link } from 'gatsby';
import facebookImage from '../images/facebook.jpg';
import favIcon from '../images/favicon.png';
import hatImage from '../images/walt-hat-450x.png';
import glassesImage from '../images/walt-glasses-450x.png';
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

const Header = ({ title, landing }) => (
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
          bodyAttributes={{ class: landing ? 'landing' : 'docs' }}
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
          <meta property="og:image" content={facebookImage} />
          <link href={favIcon} rel="icon" type="image/png" />
        </Helmet>
        <header>
          {!landing && (
            <Fragment>
              <h1>
                <Link to="/">Walt</Link>
              </h1>
            </Fragment>
          )}
          {landing && (
            <div>
              <figure>
                <img src={hatImage} alt="" className="hat" />
                <img src={glassesImage} alt="" className="glasses" />
              </figure>
              <h1>
                <Link to="/">{data.site.siteMetadata.title}</Link>
              </h1>
              <h2>{data.site.siteMetadata.subtitle}</h2>
            </div>
          )}
          <nav>
            <Link to="/demo" title="Live DEMO of Walt">
              demo
            </Link>
            <Link to="/docs" title="Dive in WALT's documentation">
              docs
            </Link>
            <a href={data.site.siteMetadata.github} title="WALT on GitHub">
              github
            </a>
          </nav>
        </header>
      </Fragment>
    )}
  />
);

export default Header;
