import React, { Component }  from 'react';
import makeCounter from './walt/counter';

export default class CounterExample extends Component {
  state = { counter: 0, instance: null };

  componentWillMount() {
    makeCounter().then(mod => this.setState({ instance: mod.instance }));
  }

  render() {
    return (
      <div>
        <p>Counter: {this.state.counter}</p>
        {this.state.instance ? (
          <div>
            <button onClick={() =>
              this.setState({
                counter: this.state.instance.exports.increment()
              })
            } >Increment!</button>
            <button onClick={() =>
              this.setState({
                counter: this.state.instance.exports.decrement()
              })
            } >Decrement!</button>
          </div>
        ) : (<span>Loading WebAssembly Module...</span>)}
      </div>
    );
  }
}

