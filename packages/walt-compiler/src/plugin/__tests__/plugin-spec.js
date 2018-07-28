import { expressionFragment } from "../../parser/fragment";
import test from "ava";
import mapNode from "../../utils/map-node";
import { combineParsers } from "..";

test("plugin system", t => {
  const calls = [];
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
          Identifier: next => node => {
            calls.push("plugin1.semantics.Identifier");
            return next(node);
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
            calls.push("plugin2.semantics.Identifier");
            return next(node);
          },
          BinaryExpression: next => node => {
            calls.push("plugin2.semantics.BinaryExpression");
            return next({
              ...node,
              type: "foobar",
            });
          },
        };
      },
    };
  };

  const base = () => {
    return {
      semantics() {
        return {
          // The final stop for parsing, will parse the children/params of all nodes
          // which have at least one parser attached to them. This is necessary
          // because the map-node utility bails out (on parsing children) if the parsing function wants
          // to use the transform argument, which we always do.
          "*": _ => (node, transform) => {
            calls.push(`base.semantics.${node.Type}`);
            return {
              ...node,
              params: node.params.map(transform),
            };
          },
        };
      },
    };
  };

  const plugins = [base, plugin1, plugin2];
  const parsers = combineParsers(plugins.map(p => p().semantics()));

  const ast = expressionFragment("x + 2;");
  const node = mapNode(parsers)(ast);

  t.deepEqual(
    calls,
    [
      "plugin2.semantics.BinaryExpression",
      "base.semantics.BinaryExpression",
      "plugin2.semantics.Identifier",
      "plugin1.semantics.Identifier",
      "base.semantics.Identifier",
    ],
    "Plugin precedence is preserved"
  );

  t.is(node.type, "foobar", "Nodes are actually parsed");
});
