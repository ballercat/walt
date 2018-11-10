import React from 'react';
import PropTypes from 'prop-types';
// import hatImage from '../images/walt-hat-450x.png';
import glassesImage from '../images/walt-glasses-450x.png';
import { Link } from 'gatsby';

function Header(props) {
  return (
    <div className="Header">
      <div className="Header-wrapper">
        <header>
          <Link to="/">
            <img src={glassesImage} alt="walt" className="Header-icon" />
          </Link>
          <div className="Navbar">
            <nav className="Navbar-wrapper">
              <ul>
                <li>
                  <Link to="/docs" title="Dive in WALT's documentation">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link to="/demo" title="Live DEMO of Walt">
                    Playground
                  </Link>
                </li>
                <li>
                  <a href={props.github} title="WALT on GitHub">
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
      </div>
    </div>
  );
}

Header.propTypes = {
  github: PropTypes.string,
};
export { Header };
