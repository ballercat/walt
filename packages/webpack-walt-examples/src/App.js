import React from 'react';
import Directory from './Directory';
import CounterExample from './CounterExample';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/counter" component={CounterExample} />
          <Route path="/" component={Directory} />
        </Switch>
      </div>
    </Router>
  );
}
