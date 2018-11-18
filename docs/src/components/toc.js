/**
 * Table of contents
 *
 * @author Arthur Buldauskas <arthurbuldauskas@gmail.com>
 */
import React, { Component } from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';

class TableOfContents extends Component {
  static propTypes = {
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        path: PropTypes.string,
        id: PropTypes.id,
        isNative: PropTypes.bool,
      })
    ),
    title: PropTypes.string,
  };

  static defaultProps = {
    title: 'Table of Contents',
  };

  render() {
    return (
      <div className="TableOfContents">
        <h4 className="TableOfContents-title">{this.props.title}</h4>
        <section className="TableOfContents-list">
          <ul>
            {this.props.pages.map(page => (
              <li
                key={page.title}
                style={{ paddingLeft: `${(Number(page.depth) - 1) * 15}px` }}
              >
                {page.isNative ? (
                  <a href={page.path}>{page.title}</a>
                ) : (
                  <Link to={page.path} title={page.title}>
                    {page.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }
}
export default TableOfContents;
