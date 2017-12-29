import test from "ava";
import Module from "module";
import loader from "..";

const __MOCK_MODULE__ = "__MOCK_MODULE__";

const waltSimple = `export function two(): i32 {
     return 2;
   }`;

const waltCounter = `let counter: i32 = 0;
export function counter(): i32 {
  let result: i32 = counter;
  counter += 1;
  return result;
}`;

const getLoaderContext = callback => ({
  callback,
  resourcePath: "./counter.walt",
  options: { context: __dirname + "/../" }
});

test("loader works", t =>
  new Promise(resolve => {
    const loaderContext = getLoaderContext((unused, result) => {
      t.truthy(result);
      resolve();
    });

    loader.call(loaderContext, waltSimple);
  }));

test("create a legit module", t =>
  new Promise(resolve => {
    Module._cache[__MOCK_MODULE__] = null;

    const loaderContext = getLoaderContext((unused, result) => {
      const module = new Module(__MOCK_MODULE__);
      module._compile(result, __MOCK_MODULE__);

      module.exports().then(webAssemblyModule => {
        const { instance: { exports: { counter } } } = webAssemblyModule;
        t.is(counter(), 0);
        t.is(counter(), 1);
        t.is(counter(), 2);
        t.is(counter(), 3);
        resolve();
      });
    });

    loader.call(loaderContext, waltCounter);
  }));
