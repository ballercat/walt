# Benchmarks

Simple benchmarks for language constructs.

## Install

```
npm install
```

## Run

```
npm run bench
```

## Tips

- Test inner loops within WASM
- Use inputs & math in tests to avoid aggressive JIT for simple branches

## Notes

### Loops

A while loop which decrements to zero is about 2x faster than a for-loop over
the same number of iterations.

### Branches

A `select` statement (written as a ternary) is slower than a if/then/else block.
Nested conditionals make a select about 2x slower.
