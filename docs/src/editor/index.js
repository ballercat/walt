import CodeMirror from "react-codemirror2";
import PropTypes from "prop-types";
import React from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/lib/codemirror.css";

class Editor extends React.PureComponent {
  static propTypes = {
    code: PropTypes.string,
    onUpdate: PropTypes.func,
    extraOptions: PropTypes.object
  };

  static defaultProps = {
    onUpdate() {},
    extraOptions: {}
  };

  render() {
    const { extraOptions, ...props } = this.props;
    return (
      <CodeMirror
        value={props.code}
        onChange={(editor, meta, value) => props.onUpdate(value)}
        options={{
          lineNumbers: true,
          mode: "javascript",
          ...extraOptions
        }}
      />
    );
  }
}

export default Editor;
