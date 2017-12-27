import React from "react";
import Editor from "./editor";
import "semantic-ui-css/semantic.min.css";
import { Header, Image, Segment } from "semantic-ui-react";
import MenuBar from "./menu-bar";
import "./css/app";
import examples from "./examples";

const exampleList = Object.keys(examples).map(key => {
  return {
    key,
    value: key,
    text: examples[key].label
  };
});

const Walt = window.Walt;

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

class Explorer extends React.Component {
  state = {
    code: examples.Default.code,
    js: examples.Default.js,
    wasm: Walt.debug(Walt.getIR(examples.Default.code)),
    compiling: false,
    logs: [],
    activeItem: "code"
  };

  compileAndRun = () => {
    const compiler = eval(`(${this.state.js})`);
    const buffer = this.intermediateRepresentation.buffer();
    Promise.resolve(compiler(buffer))
      .then(cancel =>
        // without this raf the spinner will not likely render as everything is
        // going to smush into a one long frame in expensive wasm calls :(
        requestAnimationFrame(() => this.setState({ compiling: false, cancel }))
      )
      .catch(e => {
        this.setState({ compiling: false });
        setTimeout(() => {
          throw e;
        });
      });
  };

  handleRun = debounce(() => {
    this.setState({ compiling: true }, () => {
      // raf after callback because we want to allow the UI to indicate (with a
      // spinner) that we are compiling things.
      requestAnimationFrame(() => {
        try {
          this.intermediateRepresentation = window.Walt.getIR(this.state.code);
          const wasm = Walt.debug(this.intermediateRepresentation);
          this.setState({ wasm }, this.compileAndRun);
        } catch (e) {
          this.setState({ compiling: false });
          setTimeout(() => {
            throw e;
          });
        }
      });
    });
  }, 1000);

  handleStop = () => {
    this.state.cancel();
    this.setState({
      cancel: null
    });
  };

  updateJS = js => {
    this.setState({ js });
  };

  handleUpdate = code => {
    this.setState({ code });
  };

  handleMenuClick = (e, { name: activeItem }) => {
    this.setState({ activeItem });
  };

  handleSelectExample = (e, { value }) => {
    const { js, code } = examples[value];
    this.setState({ compiling: true });
    requestAnimationFrame(() => this.setState({ code, js, compiling: false }));
  };

  render() {
    const { activeItem } = this.state;
    return (
      <div className="App">
        <header className="Header">
          <Header as="h1">
            <Image shape="circular" src="dist/walt.png" />
          </Header>
        </header>
        <MenuBar
          examples={exampleList}
          onMenuClick={this.handleMenuClick}
          onRun={this.handleRun}
          onSelect={this.handleSelectExample}
          onStop={this.handleStop}
          cancellable={this.state.cancel != null}
        />
        <Segment className="Main" loading={this.state.compiling}>
          {(test => {
            switch (test) {
              case "code":
                return (
                  <Editor
                    key="code"
                    code={this.state.code}
                    onUpdate={this.handleUpdate}
                  />
                );
              case "JS":
                return (
                  <Editor
                    key="js"
                    code={this.state.js}
                    onUpdate={this.updateJS}
                  />
                );
              case "WASM":
                return (
                  <Editor
                    key="wasm"
                    code={this.state.wasm}
                    extraOptions={{ readOnly: true }}
                  />
                );
              case "Canvas":
                return (
                  <div>
                    <canvas id="canvas" width="500" height="400" />
                  </div>
                );
            }
          })(activeItem)}
        </Segment>
      </div>
    );
  }
}

export default Explorer;
