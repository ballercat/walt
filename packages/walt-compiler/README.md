# Walt Compiler
This is the main walt compiler package.

### Install

`npm install --save walt-compiler`

### API

```js
import compileWalt, { debug as printWasm } from 'walt-compiler';

const buffer = compileWalt(`
  export function count() {
    counter += 1;
    return counter;
  }
`);

console.log('WASM binary!', printWasm(buffer));

WebAssembly.instantiate(buffer).then(module => {
  console.log(`Counter export: ${module.instance.exports.count()}`);
});
```
