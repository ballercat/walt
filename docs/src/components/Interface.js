/**
 * Interface Component for internal APIs
 *
 * @author Arhtur Buldauskas<arthurbuldauskas@gmail.com>
 */
import React from 'react';
import PropTypes from 'prop-types';

const Interface = props => {
  return (
    <article>
      <h3 name={props.name}>
        <a href={`#${props.name}`}>{props.name}</a>
      </h3>
      <div
        className="info"
        dangerouslySetInnerHTML={{ __html: props.descriptionHTML }}
      />
      <div className="info">
        {props.examples.map(example => (
          <pre
            key={example.what}
            className="language-javascript"
            dangerouslySetInnerHTML={{ __html: example.html }}
          />
        ))}
      </div>
      <div className="info">
        <h4>Parameters</h4>
        <ul>
          {props.parameters.map(param => (
            <li key={param.name}>
              {param.name}: {param.type || 'any'}
            </li>
          ))}
        </ul>
      </div>
      <div className="info">
        <h4>Returns</h4>
        {props.returns.map(ret => (
          <div key={ret.name}>
            <pre>{ret.type}</pre>
          </div>
        ))}
      </div>
    </article>
  );
};

Interface.propTypes = {
  name: PropTypes.string.isRequired,
  descriptionHTML: PropTypes.string.isRequired,
  parameters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
    })
  ).isRequired,
  returns: PropTypes.string.isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      what: PropTypes.string,
      html: PropTypes.string,
    })
  ).isRequired,
};

export default Interface;
