import { UnControlled as CodeMirror } from 'react-codemirror2';
import PropTypes from 'prop-types';
import React from 'react';
import { compile, prettyPrintNode } from 'walt-compiler';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

function debounce(func, wait) {
  let timeout = null;
  return (...args) => {
    let later = () => {
      timeout = null;
      func.apply(null, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class Editor extends React.PureComponent {
  static propTypes = {
    onUpdate: PropTypes.func,
    extraOptions: PropTypes.object,
    children: PropTypes.node,
  };

  static defaultProps = {
    onUpdate() {},
    extraOptions: {},
  };

  constructor(props) {
    super(props);
    const source = decodeURI(props.children)
      .replace(/```/g, '')
      .trim();
    let result = 'Syntax Error.';
    try {
      result = compile(source);
    } catch (e) {
      // eslint-disable-next-line
      console.error(`${e.message}
Error compiling

${source}
`);
      console.log(props.children);
    }
    this.state = {
      wasm: prettyPrintNode(result.semanticAST),
      source,
    };
  }

  // This is here strictly for hot-reloading support
  static getDerivedStateFromProps(props, state) {
    const source = decodeURI(props.children)
      .replace(/```/g, '')
      .trim();
    if (state.source !== source) {
      return {
        source,
      };
    }
    return null;
  }

  handleChange = debounce((_, __, value) => {
    const source = decodeURI(value).trim();
    try {
      const result = compile(source);
      this.setState({
        wasm: prettyPrintNode(result.semanticAST),
      });
      // eslint-disable-next-line
    } catch (e) {}
  }, 500);

  render() {
    const { extraOptions } = this.props;
    return (
      <div className="Sandbox">
        <CodeMirror
          value={this.state.source}
          onChange={this.handleChange}
          className="Sandbox-editor"
          options={{
            lineNumbers: true,
            mode: 'javascript',
            theme: 'monokai',
            tabSize: 4,
            ...extraOptions,
          }}
        />
        <div className="Sandbox-output">{this.state.wasm}</div>
      </div>
    );
  }
}

export default Editor;
