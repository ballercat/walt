/**
 * Array Plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import invariant from 'invariant';
import { find } from 'walt-parser-tools/scope';
import { extendNode } from '../utils/extend-node';
import withContext from '../utils/transform-with-context';
import pick from '../utils/pick';
import type { SemanticPlugin } from '../flow/types';
import print from '../utils/print-node';

const shifts = { i32: 2, f32: 2, i64: 3, f64: 3 };
const NATIVE_ARRAY_TYPE = 'i32';

function semantics({ stmt }) {
  const declaration = next => args => {
    const [node, context] = args;

    // For every declaration of array types we will strip the declaration type
    // to a core type (i32) and attach the original type reference as metadata
    if (!String(node.type).endsWith('[]')) {
      return next(args);
    }

    const decl = extendNode(
      {
        type: NATIVE_ARRAY_TYPE,
        meta: { TYPE_ARRAY: node.type.slice(0, -2) },
      },
      node
    );
    return next([decl, context]);
  };

  function arrayOffset(base, offset) {
    const shift = shifts[base.meta.TYPE_ARRAY];

    if (shift == null) {
      return null;
    }

    return offset.Type !== Syntax.Constant || Number(offset.value)
      ? stmt`(${base} + (${offset} << ${shift}));`
      : stmt`(${base});`;
  }

  function sanityCheck(subscript) {
    return !(subscript.type == null || subscript.index == null);
  }

  function produceSubscript([base, offset]) {
    const type = base.meta.TYPE_ARRAY;
    const index = arrayOffset(base, offset);

    return { type, index, TYPE_ARRAY: base.meta.TYPE_ARRAY };
  }

  return {
    [Syntax.Declaration]: declaration,
    [Syntax.ImmutableDeclaration]: declaration,
    [Syntax.Identifier]: next => args => {
      const [node, context] = args;
      const ref = find(context.scopes, node.value);
      if (!(ref && ref.meta.TYPE_ARRAY)) {
        return next(args);
      }

      // Before moving on to the core parser all identifiers need to have
      // concrete basic types
      return next([extendNode(pick(['type', 'meta'], ref), node), context]);
    },
    [Syntax.Assignment]: next => (args, t) => {
      const [node, context] = args;
      const [lhs, rhs] = node.params;

      if (lhs.Type !== Syntax.ArraySubscript) {
        return next(args);
      }

      const transform = withContext(t, context);
      const subscript = produceSubscript(lhs.params.map(transform));
      const { type, index } = subscript;

      if (!sanityCheck(subscript)) {
        return next(args);
      }

      return transform(stmt`${type}.store(${index}, ${rhs});`);
    },
    [Syntax.ArraySubscript]: next => (args, t) => {
      const [node, context] = args;
      const transform = withContext(t, context);
      const subscript = produceSubscript(node.params.map(transform));
      const { type, index, TYPE_ARRAY } = subscript;

      if (!sanityCheck(subscript)) {
        return next(args);
      }

      return extendNode(
        { meta: { TYPE_ARRAY } },
        transform(stmt`${type}.load(${index});`)
      );
    },
  };
}
export default function arrayPlugin(): SemanticPlugin {
  return { semantics };
}
