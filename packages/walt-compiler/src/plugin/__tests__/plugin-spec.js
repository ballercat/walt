import { expressionFragment } from "../../parser/fragment";
import test from "ava";
import mapNode from "../../utils/map-node";
import { compose } from "..";
import realCompose from "../../utils/compose";

test("plugin compose logic", t => {
  const transforms = [
    next => (n, t) => {
      console.log("4");
      return {
        ...n,
        params: n.params.map(t),
      };
    },
    next => n => console.log("3") || next(n),
    next => n => {
      console.log("2");
      if (n.value === "b") {
        return n;
      }
      return next(n);
    },
    next => n => console.log("1") || next(n),
  ];

  const wrapper = ts => {
    let transform;

    const chain = ts.reduce((stack, go) => {
      return go(node => {
        return stack(node, transform);
      });
    }, identity => identity);

    return (node, tt) => {
      transform = tt;
      return chain(node, transform);
    };
  };

  const testNode = {
    Type: "Identifier",
    value: "a",
    params: [{ Type: "Identifier", value: "b", params: [] }],
  };

  const final = mapNode({
    Identifier: wrapper(transforms),
  });

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
