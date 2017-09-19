import CodeMirror from 'react-codemirror';
import React from 'react';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import './css/app';

const DEFAULT_EXAMPLE = `const x: i32 = 2;
  export function echo(): i32 {
    const x: i32 = 42;
    return x;
}`;

class EchoConsole extends React.Component {
  constructor() {
    super();
    this.state = {
      logs: []
    }
  }
  componentDidMount() {
    const oldConsole = {};
    const selectMethods = [ 'log', 'dir', 'warn', 'error', 'info'];
    Object.keys(console).filter(method => selectMethods.includes(method)).forEach(method => {
      oldConsole[method] = console[method].bind(console);
      console[method] = (...args) => {
        oldConsole[method].apply(null, args);
        this.setState(state => ({
          logs: [...state.logs, {
            level: method,
            content: JSON.stringify(args)
          }]
        }))
      }
    });

  }
  render() {
    return (
      <code className="Console"><pre>{this.state.logs.map(log => `${log.level}: ${log.content} \n`)}</pre></code>
    )
  }
}
//    const wasm = window.Walt.getIR(src)
//    binary.$blockScrolling = Infinity
//    binary.setValue(wasm.debug(), -1)
//    WebAssembly.instantiate(wasm.buffer()).then(result => {
//      console.log('Module', result.module)
//      console.log('Instance', result.instance)
//      const exports = result.instance.exports
//      console.log(
//        'Exports',
//        Object.keys(result.instance.exports).forEach(
//          k =>
//            typeof exports[k] === 'function'
//              ? console.log(`${k} => ${exports[k]()}`)
//              : console.log(`${k} => ${exports[k]}`),
//        ),
//      )
//    })
//  })

class Explorer extends React.Component {
  state = {
    code: DEFAULT_EXAMPLE
  }
  handleUpdate = (code) => {
    this.setState({ code });
  }
  handleCompile = () => {
  }
  render() {
    return (
      <div>
        <header className="Header" key="header">
          <h1 className="Header-title">Walt Explorer</h1>
        </header>,
        <main className="Main" key="main">
          <div className="Main-leftContainer">
            <div className="Main-editor" id="editor">
              <CodeMirror
                value={this.state.code}
                onChange={this.handleUpdate}
                options={{
                  lineNumbers: true,
                  mode: 'javascript'
                }}
              />
            </div>
          </div>
          <div className="Main-btnContainer">
            <button
              id="compile"
              className="Main-compile"
              onClick={this.handleCompile}
            >
              Compile
            </button>
          </div>
          <div className="Main-rightContainer">
            <div className="Main-binary" id="binary" />
          </div>
        </main>,
        <footer className="Footer">
          <EchoConsole />
        </footer>
      </div>
    );
  }
}

export default Explorer

