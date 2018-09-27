# Walt Nodes

Walt AST nodes have a base type shared across all node types.

_The `Marker` data structure is filled in by the tokenizer and base parser._

```js
// @flow
type Marker = {
  sourceLine: string,
  line: number,
  col: number,
};
type MetadataType = { [string]: any };

type BaseNode = {
  range: Marker[],
  type: string | null,
  value: string,
  meta: MetadataType,
};
```

With each additional node having specific `Type` and `params`.

```js
// @flow
type Identifier = BaseNode & {
  Type: 'Identifier',
  params: [],
};
```

All nodes in the AST must implement this structure.

## Program Structure

To examine the full structure of the program please refer to the Walt
[Formal EBNF Grammar](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form)
you can see the source code for the grammar [here](./grammar/grammar.ne).
