import CodeMirror from 'react-codemirror';
import PropTypes from 'prop-types';
import React from 'react';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

const Editor = ({ extraOptions, ...props }) => (
  <CodeMirror
    value={props.code}
    onChange={props.onUpdate}
    options={{
      lineNumbers: true,
      mode: 'javascript',
      ...extraOptions
    }}
  />
);

Editor.propTypes = {
  code: PropTypes.string,
  onUpdate: PropTypes.func,
  extraOptions: PropTypes.object
};

Editor.defaultProps = {
  onUpdate() {},
  extraOptions: {}
};

export default Editor;

