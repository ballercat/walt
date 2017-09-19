import React from 'react';
import Editor from './editor';
import 'semantic-ui-css/semantic.min.css';
import { Tab, Container } from 'semantic-ui-react';
import './css/app';

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const DEFAULT_EXAMPLE =
`const x: i32 = 2;
export function echo(): i32 {
  const x: i32 = 42;
  return x;
}`;

const Console = (props) => (
  <code className="Console">
    <pre>
      {props.logs.map(log => `${log} \n`)}
    </pre>
  </code>
)

class Explorer extends React.Component {
  state = {
    code: DEFAULT_EXAMPLE,
    wasm: window.Walt.getIR(DEFAULT_EXAMPLE).debug(),
    logs: []
  }

  panes = [
    {
      menuItem: 'Code',
      render: () => (
        <Tab.Pane>
          <Editor key="code" code={this.state.code} onUpdate={this.handleUpdate} />
        </Tab.Pane>
      )
    },
    {
      menuItem: 'WebAssembly',
      render: () => (
        <Tab.Pane>
          <Editor
            key="wasm"
            code={this.state.wasm}
            extraOptions={{ readOnly: true }}
          />
        </Tab.Pane>
      )
    }
  ]

  updateWasm = debounce(() => {
    try {
      this.intermediateRepresentation = window.Walt.getIR(this.state.code);
      const wasm = this.intermediateRepresentation.debug();
      this.setState(
        { wasm },
        () => {
          WebAssembly.instantiate(
            this.intermediateRepresentation.buffer()
          ).then(result => {
            const exports = result.instance.exports;
            if (exports) {
              window.exports = exports;
              const logs = [];
              Object.keys(exports).forEach(k => {
                if (typeof exports[k] === 'function') {
                  logs.push(JSON.stringify(exports[k]()));
                } else {
                  logs.push(JSON.stringify(exports[k]));
                }
              });
              this.setState({ logs });
            }
          }).catch(e => {
            this.setState({ logs: [e.toString()] });
          });
        }
      );
    } catch(e) {
      this.setState(() => {
        return { logs: [e.toString()] };
      });
    }
  }, 1000)

  handleUpdate = (code) => {
    this.setState({ code }, this.updateWasm);
  }

  render() {
    return (
      <div>
        <header className="Header" key="header">
          <h1 className="Header-title">Walt Explorer</h1>
        </header>,
        <main className="Main" key="main">
          <Container fluid>
            <Tab panes={this.panes} />
          </Container>
        </main>,
        <footer className="Footer">
          <Console logs={this.state.logs} />
        </footer>
      </div>
    );
  }
}

export default Explorer

