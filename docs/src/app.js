import React from "react";
import Editor from "./editor";
import "semantic-ui-css/semantic.min.css";
import {
  Menu,
  Container,
  Header,
  Image,
  Dropdown,
  Segment,
  Loader,
  Dimmer
} from "semantic-ui-react";
import "./css/app";
import examples from "./examples";

const exampleList = Object.keys(examples).map(key => {
  return {
    key,
    value: key,
    text: key
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

  updateWasm = debounce(() => {
    try {
      this.intermediateRepresentation = window.Walt.getIR(this.state.code);
      const wasm = Walt.debug(this.intermediateRepresentation);
      this.setState({ wasm, compiling: true }, () => {
        const compiler = eval(`(${this.state.js})`);
        Promise.resolve(compiler(this.intermediateRepresentation.buffer()))
          .then(() =>
            setTimeout(() => this.setState(() => ({ compiling: false })), 100)
          )
          .catch(e => {
            this.setState({ compiling: false });
            setTimeout(() => {
              throw e;
            });
          });
      });
    } catch (e) {
      setTimeout(() => {
        throw e;
      });
    }
  }, 1000);

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
    setTimeout(
      () =>
        this.setState({
          js,
          code
        }),
      200
    );
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
        <Menu>
          <Menu.Item
            name="code"
            active={activeItem === "code"}
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            name="JS"
            active={activeItem === "JS"}
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            name="WASM"
            active={activeItem === "WASM"}
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            color="green"
            active={activeItem === "&#9658;"}
            name="&#9658;"
            onClick={this.updateWasm}
          />
          <Menu.Menu position="right">
            <Menu.Item>
              <Dropdown
                placeholder="Example"
                selection
                options={exampleList}
                onChange={this.handleSelectExample}
              />
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <Segment loading={this.state.compiling}>
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
            }
          })(activeItem)}
        </Segment>
      </div>
    );
  }
}

export default Explorer;
