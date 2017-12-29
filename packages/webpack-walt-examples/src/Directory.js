import React from 'react';
import { Link } from 'react-router-dom';

export default function Directory() {
  return (
    <ul>
      <li><Link to="/counter">Counter Example</Link></li>
    </ul>
  );
}
