# walt-cli

Line wrapper around the [Walt WebAssembly Compiler](https://github.com/ballercat/walt). Intended to be used to
build and package node modules utilizing WebAssembly/Walt. For browser integration
use the [webpack-loader](https://github.com/ballercat/walt/tree/master/packages/walt-loader).

## Install

```bash
npm install --save-dev walt-cli walt-compiler walt-link
```

In your `package.json`

```json
{
  "scripts": {
    "walt": "walt-cli"
  }
}
```

## Usage

```bash
npm run walt -- index.walt
```
