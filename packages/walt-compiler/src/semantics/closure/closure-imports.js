// @flow

// Pre-built static AST for injected closure imports
export default [
  {
    Type: "Import",
    value: "import",
    range: [
      { sourceLine: "import {", line: 2, col: 0 },
      { sourceLine: "} from 'closure';", line: 6, col: 17 },
    ],
    meta: [],
    params: [
      {
        Type: "Sequence",
        value: ",",
        range: [null, { sourceLine: "} from 'closure';", line: 6, col: 1 }],
        meta: [],
        params: [
          {
            Type: "Pair",
            value: ":",
            range: [
              {
                sourceLine: "  'closure--get': ClosureGetType,",
                line: 3,
                col: 2,
              },
              {
                sourceLine: "  'closure--get': ClosureGetType,",
                line: 3,
                col: 16,
              },
              {
                sourceLine: "  'closure--get': ClosureGetType,",
                line: 3,
                col: 33,
              },
            ],
            meta: [],
            params: [
              {
                Type: "StringLiteral",
                value: "closure--get",
                range: [
                  {
                    sourceLine: "  'closure--get': ClosureGetType,",
                    line: 3,
                    col: 2,
                  },
                  {
                    sourceLine: "  'closure--get': ClosureGetType,",
                    line: 3,
                    col: 16,
                  },
                ],
                meta: [],
                params: [],
                type: null,
              },
              {
                Type: "Identifier",
                value: "ClosureGetType",
                range: [
                  {
                    sourceLine: "  'closure--get': ClosureGetType,",
                    line: 3,
                    col: 18,
                  },
                  {
                    sourceLine: "  'closure--get': ClosureGetType,",
                    line: 3,
                    col: 32,
                  },
                ],
                meta: [],
                params: [],
                type: null,
              },
            ],
            type: null,
          },
          {
            Type: "Pair",
            value: ":",
            range: [
              {
                sourceLine: "  'closure--get-i32': ClosureGetType,",
                line: 4,
                col: 2,
              },
              {
                sourceLine: "  'closure--get-i32': ClosureGetType,",
                line: 4,
                col: 20,
              },
              {
                sourceLine: "  'closure--get-i32': ClosureGetType,",
                line: 4,
                col: 37,
              },
            ],
            meta: [],
            params: [
              {
                Type: "StringLiteral",
                value: "closure--get-i32",
                range: [
                  {
                    sourceLine: "  'closure--get-i32': ClosureGetType,",
                    line: 4,
                    col: 2,
                  },
                  {
                    sourceLine: "  'closure--get-i32': ClosureGetType,",
                    line: 4,
                    col: 20,
                  },
                ],
                meta: [],
                params: [],
                type: null,
              },
              {
                Type: "Identifier",
                value: "ClosureGetType",
                range: [
                  {
                    sourceLine: "  'closure--get-i32': ClosureGetType,",
                    line: 4,
                    col: 22,
                  },
                  {
                    sourceLine: "  'closure--get-i32': ClosureGetType,",
                    line: 4,
                    col: 36,
                  },
                ],
                meta: [],
                params: [],
                type: null,
              },
            ],
            type: null,
          },
          {
            Type: "Pair",
            value: ":",
            range: [
              {
                sourceLine: "  'closure--set-i32': ClosureSetType",
                line: 5,
                col: 2,
              },
              {
                sourceLine: "  'closure--set-i32': ClosureSetType",
                line: 5,
                col: 20,
              },
              { sourceLine: "} from 'closure';", line: 6, col: 1 },
            ],
            meta: [],
            params: [
              {
                Type: "StringLiteral",
                value: "closure--set-i32",
                range: [
                  {
                    sourceLine: "  'closure--set-i32': ClosureSetType",
                    line: 5,
                    col: 2,
                  },
                  {
                    sourceLine: "  'closure--set-i32': ClosureSetType",
                    line: 5,
                    col: 20,
                  },
                ],
                meta: [],
                params: [],
                type: null,
              },
              {
                Type: "Identifier",
                value: "ClosureSetType",
                range: [
                  {
                    sourceLine: "  'closure--set-i32': ClosureSetType",
                    line: 5,
                    col: 22,
                  },
                  {
                    sourceLine: "  'closure--set-i32': ClosureSetType",
                    line: 5,
                    col: 36,
                  },
                ],
                meta: [],
                params: [],
                type: null,
              },
            ],
            type: null,
          },
        ],
        type: null,
      },
      {
        Type: "StringLiteral",
        value: "closure",
        range: [
          { sourceLine: "} from 'closure';", line: 6, col: 7 },
          { sourceLine: "} from 'closure';", line: 6, col: 16 },
        ],
        meta: [],
        params: [],
        type: null,
      },
    ],
    type: null,
  },
  {
    Type: "Typedef",
    value: "ClosureGetType",
    range: [
      { sourceLine: "type ClosureGetType = (i32) => i32;", line: 7, col: 0 },
      { sourceLine: "type ClosureGetType = (i32) => i32;", line: 7, col: 35 },
    ],
    meta: [],
    params: [
      {
        Type: "FunctionArguments",
        value: "FUNCTION_ARGUMENTS",
        range: [
          {
            sourceLine: "type ClosureGetType = (i32) => i32;",
            line: 7,
            col: 23,
          },
          {
            sourceLine: "type ClosureGetType = (i32) => i32;",
            line: 7,
            col: 26,
          },
        ],
        meta: [],
        params: [
          {
            Type: "Type",
            value: "i32",
            range: [
              {
                sourceLine: "type ClosureGetType = (i32) => i32;",
                line: 7,
                col: 23,
              },
              {
                sourceLine: "type ClosureGetType = (i32) => i32;",
                line: 7,
                col: 26,
              },
            ],
            meta: [],
            params: [],
            type: "i32",
          },
        ],
        type: "i32",
      },
      {
        Type: "FunctionResult",
        value: "FUNCTION_RESULT",
        range: [
          {
            sourceLine: "type ClosureGetType = (i32) => i32;",
            line: 7,
            col: 31,
          },
          {
            sourceLine: "type ClosureGetType = (i32) => i32;",
            line: 7,
            col: 34,
          },
        ],
        meta: [],
        params: [],
        type: "i32",
      },
    ],
    type: "i32",
  },
  {
    Type: "Typedef",
    value: "ClosureSetType",
    range: [
      {
        sourceLine: "type ClosureSetType = (i32, i32) => void;",
        line: 8,
        col: 0,
      },
      {
        sourceLine: "type ClosureSetType = (i32, i32) => void;",
        line: 8,
        col: 41,
      },
    ],
    meta: [],
    params: [
      {
        Type: "FunctionArguments",
        value: "FUNCTION_ARGUMENTS",
        range: [
          null,
          {
            sourceLine: "type ClosureSetType = (i32, i32) => void;",
            line: 8,
            col: 32,
          },
        ],
        meta: [],
        params: [
          {
            Type: "Sequence",
            value: ",",
            range: [
              null,
              {
                sourceLine: "type ClosureSetType = (i32, i32) => void;",
                line: 8,
                col: 32,
              },
            ],
            meta: [],
            params: [
              {
                Type: "Type",
                value: "i32",
                range: [
                  {
                    sourceLine: "type ClosureSetType = (i32, i32) => void;",
                    line: 8,
                    col: 23,
                  },
                  {
                    sourceLine: "type ClosureSetType = (i32, i32) => void;",
                    line: 8,
                    col: 26,
                  },
                ],
                meta: [],
                params: [],
                type: "i32",
              },
              {
                Type: "Type",
                value: "i32",
                range: [
                  {
                    sourceLine: "type ClosureSetType = (i32, i32) => void;",
                    line: 8,
                    col: 28,
                  },
                  {
                    sourceLine: "type ClosureSetType = (i32, i32) => void;",
                    line: 8,
                    col: 31,
                  },
                ],
                meta: [],
                params: [],
                type: "i32",
              },
            ],
            type: null,
          },
        ],
        type: null,
      },
      {
        Type: "FunctionResult",
        value: "FUNCTION_RESULT",
        range: [
          {
            sourceLine: "type ClosureSetType = (i32, i32) => void;",
            line: 8,
            col: 36,
          },
          {
            sourceLine: "type ClosureSetType = (i32, i32) => void;",
            line: 8,
            col: 40,
          },
        ],
        meta: [],
        params: [],
        type: "void",
      },
    ],
    type: "void",
  },
];
