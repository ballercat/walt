import React from 'react'

import imageCode from '../images/code-240x.png'
import imageLightning from '../images/lightning-240x.png'
import imageFlask from '../images/flask-240x.png'

import './WhatAnimation.scss'

export default () => (
  <div className='what-animation'>
    <figure className='code'>
      <img src={imageCode} alt='.walt code' />
      <figcaption>.walt</figcaption>
    </figure>
    <span>&gt;</span>
    <figure className='chemistry'>
      <img src={imageLightning} alt='' className='lightning' />
      <img src={imageFlask} alt='' className='flask' />
    </figure>
    <span>&gt;</span>
    <figure className='code'>
      <img src={imageCode} alt='WebAssembly' />
      <figcaption>.wasm</figcaption>
    </figure>
  </div>
)
