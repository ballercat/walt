import React from 'react';
import Layout from '../components/LayoutBasic';
import Prism from 'prismjs';
import BeakerAnimation from '../components/beaker-animation';
import { AnimatedLogo } from '../components/animated-logo';

const codeSampleHTML = Prism.highlight(
  `export function fibonacci(n: i32): i32 {
  if (n <= 0) return 0;
  if (n == 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  Prism.languages.javascript,
  'javascript'
);

const IndexPage = () => (
  <Layout title="Home">
    <div className="Intro">
      <AnimatedLogo />
      <h1>Walt</h1>
      <div className="Intro-tagline">Alternative syntax for WebAssembly</div>
    </div>
    <Layout.Content>
      <div className="Promo">
        <div className="Promo-title">
          <h3>{"What's Walt?"}</h3>
        </div>
        <div className="Promo-content">
          <div>
            <pre
              className="language-javascript"
              dangerouslySetInnerHTML={{ __html: codeSampleHTML }}
            />
          </div>
          <div className="Promo-tagline">
            Walt allows you to code directly in WebAssembly with a familiar
            JavaScript-like syntax.
          </div>
        </div>
        <div className="Promo-flare">
          <BeakerAnimation />
          <h3>Walt does the chemistry for you</h3>
          <div className="Promo-features">
            <ul>
              <li>Runs anywhere, Browser or Node.</li>
              <li>Lightweight syntax maps directly to WebAssembly.</li>
              <li>Zero dependencies. NO LLVM/binary toolkits required.</li>
              <li>
                Fast compilation. Unopinonated, integrates into any build tool.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="CallToAction">
        <div className="CallToAction-container">
          <a href="/demo" className="CallToAction-container-button">
            Demo
          </a>
          <a href="" className="CallToAction-container-button">
            GitHub
          </a>
          <a href="/docs" className="CallToAction-container-button">
            Docs
          </a>
        </div>
      </div>
    </Layout.Content>
  </Layout>
);

export default IndexPage;
