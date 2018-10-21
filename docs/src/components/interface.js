/**
 * Interface Component for internal APIs
 *
 * @author Arhtur Buldauskas<arthurbuldauskas@gmail.com>
 */
import React from 'react';
import PropTypes from 'prop-types';
import { renderAst } from '../render-ast';

const Interface = props => {
  return (
    <article>
      <h3 name={props.name}>
        <a href={`#${props.name}`}>{props.name}</a>
      </h3>
      <div className="Info">
        {props.description && renderAst(props.description)}
      </div>
      <div className="Info">
        {props.examples.map(example => (
          <pre
            key={example.what}
            className="language-js"
            dangerouslySetInnerHTML={{ __html: example.html }}
          />
        ))}
      </div>
      <div className="Info Info--params">
        <h4>Parameters</h4>
        <ol>
          {props.parameters.map(param => (
            <li key={param.name}>
              <code className="Language">{param.name}</code>: (
              <code className="Language">{param.type || 'any'}</code>
              ): {param.description && renderAst(param.description)}
            </li>
          ))}
        </ol>
      </div>
      <div className="Info">
        <h4>Returns</h4>
        <ul>
          {props.returns.map(ret => (
            <li key={ret.name}>
              <code className="Language">{ret.name}</code>:{' '}
              <code className="Language">{ret.type}</code>
              {ret.descripton && renderAst(ret.description)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};

Interface.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.object.isRequired,
  parameters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      description: PropTypes.object,
    })
  ).isRequired,
  returns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      description: PropTypes.object,
    })
  ).isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      what: PropTypes.string,
      html: PropTypes.string,
    })
  ).isRequired,
};

export default Interface;
