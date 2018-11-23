# Benchmarks

Simple benchmarks for the language constructs.

## Install

```
npm install
```

## Run

```
npm run bench
```

## Notes

### Loops

A while loop which decrements to zero is about 2x faster than a for-loop over
the same number of iterations.

### Branches

A `select` statement (written as a ternary) is slower than a if/then/else block.
Nested conditionals make a select about 2x slower.
