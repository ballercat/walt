/**
 * Animated logo
 *
 */
import React from 'react';
import hatImage from '../images/walt-hat-450x.png';
import glassesImage from '../images/walt-glasses-450x.png';

function AnimatedLogo(props) {
  return (
    <figure className="AnimatedLogo">
      <img src={hatImage} alt="" className="hat" />
      <img src={glassesImage} alt="" className="glasses" />
    </figure>
  );
}

export { AnimatedLogo };
