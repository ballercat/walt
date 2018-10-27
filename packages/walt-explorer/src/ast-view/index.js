import React, { Component } from "react";

const nodeMap = new Map();
let nodeId = 0;
const getNodeKey = node => {
  if (nodeMap.has(node)) {
    return nodeMap.get(node);
  }

  nodeId += 1;

  nodeMap.set(node, "node_" + String(nodeId));

  return nodeId;
};

class Node extends Component {
  static defaultProps = {
    root: false
  };

  state = {
    open: this.props.root
  };

  handleClick = () => {
    this.setState(prev => ({
      open: !prev.open
    }));
  };

  render() {
    return (
      <ul className={`Node ${this.state.open ? "is-open" : "is-closed"}`}>
        <span className="Node-expand" onClick={this.handleClick}>
          {this.props.Type}
        </span>
        {this.state.open ? (
          [
            <li key="node_value">
              <span className="Node-key">value: </span>
              <span className="Node-value">
                {JSON.stringify(this.props.value)}
              </span>
            </li>,
            <li key="node_type">
              <span className="Node-key">type: </span>
              <span className="Node-value">
                {JSON.stringify(this.props.type)}
              </span>
            </li>
          ]
        ) : (
          <span className="Node-preview">{this.props.value}</span>
        )}

        {this.state.open ? (
          <ul>
            <li>
              <span className="Node-key">params: [</span>
            </li>
            {this.props.params.map(
              node =>
                node ? (
                  <li className="Node-param" key={getNodeKey(node)}>
                    <Node {...node} />
                  </li>
                ) : null
            )}
            <li>
              <span className="Node-key">]</span>
            </li>
          </ul>
        ) : null}
      </ul>
    );
  }
}

export default function(props) {
  return (
    <div className="Ast Tree">
      <Node {...props.ast} root />
    </div>
  );
}
