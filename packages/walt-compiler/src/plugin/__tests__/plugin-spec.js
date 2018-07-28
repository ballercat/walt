import { expressionFragment } from "../../parser/fragment";
import test from "ava";
import mapNode from "../../utils/map-node";
import { compose } from "..";
import realCompose from "../../utils/compose";

test("plugin compose logic", t => {
  const identity = id => id;

  const transforms = [
    next => n => console.log("3") || next(n),
    next => n => {
      console.log("2");
      return next(n);
    },
    next => n => {
      console.log("1");
      return next(n);
    },
  ];

  const final = (ts => {
    let i = ts.length - 1;
    const next = n => {
      if (i > 0) {
        i -= 1;
        return chain[i](n);
      }
      return n;
    };
    const chain = ts.map(m => m(next));

    return chain.pop();
  })(transforms);

  const testNode = {
    value: "a",
    params: [{ value: "b", params: [] }],
  };

  debugger;

  console.log("result ---> ", final(testNode), "\n");
});

test.skip("plugin system", t => {
  // Should be able to call a method to get all plugins
  const plugin1 = () => {
    // Should return middleware
    return {
      // do something with options
      parser() {
        // must return an object
        return {};
      },
      // do something with options
      semantics() {
        return {
          Identifier: next => (node, transform) => {
            console.log("plugin 1, semantics Identifier");
            return next(transform(node));
          },
        };
      },
    };
  };

  const plugin2 = () => {
    return {
      semantics() {
        return {
          Identifier: next => node => {
            console.log("plugin 2, semantics Identifier");
            return next(node);
          },
        };
      },
    };
  };

  const plugins = [plugin1, plugin2];

  const parsers = compose(plugins.map(v => v().semantics()));

  const node = mapNode(parsers)(expressionFragment("x + 2;"));

  console.log(node);
});
