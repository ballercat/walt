import React from "react";
import Editor from "./editor";
import "semantic-ui-css/semantic.min.css";
import { Header, Image, Segment } from "semantic-ui-react";
import MenuBar from "./menu-bar";
import "./css/app";
import examples from "./examples";
import AstView from "./ast-view";
import waltCompiler, {
  compile,
  prettyPrintNode as printNode
} from "walt-compiler";
import { plugin as closurePlugin } from "walt-plugin-syntax-closure";

const exampleList = Object.keys(examples).map(key => {
  return {
    key,
    value: key,
    text: examples[key].label
  };
});

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
  state = (() => {
    const wasm = compile(examples.Default.code);
    return {
      code: examples.Default.code,
      extensions: [],
      js: examples.Default.js,
      ast: wasm.ast,
      wasm: printNode(wasm.ast),
      compiling: false,
      logs: [],
      activeItem: "code",
      example: "Default"
    };
  })();

  compileAndRun = () => {
    const compiler = eval(`(${this.state.js})`);
    const buffer = this.bytecode;
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
          const config = {
            version: 1,
            encodeNames: true,
            filename: this.state.example,
            source: this.state.code.split("\n"),
            extensions: this.state.extensions
          };

          const wasm = compile(this.state.code, config);
          this.bytecode = wasm.buffer();
          this.setState(
            { wasm: printNode(wasm.ast), ast: wasm.ast },
            this.compileAndRun
          );
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
    this.setState({
      code,
      ast: compile(code, { extensions: this.state.extensions }).ast
    });
  };

  handleMenuClick = (e, { name: activeItem }) => {
    this.setState({ activeItem });
  };

  handleSelectExample = (e, { value }) => {
    const { js, code, extensions } = examples[value];
    this.setState({ compiling: true, example: value });

    const wasm = compile(code, { extensions });
    requestAnimationFrame(() =>
      this.setState({
        code,
        js,
        compiling: false,
        extensions,
        ast: wasm.ast
      })
    );
  };

  render() {
    const { activeItem } = this.state;
    return (
      <div className="App">
        <header className="Header">
          <Header as="h1">
            <Image shape="circular" src="walt.png" />
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
              case "AST":
                return <AstView ast={this.state.ast} />;
            }
          })(activeItem)}
        </Segment>
      </div>
    );
  }
}

export default Explorer;
