---

path: "/"

---


### What's Walt?

**Walt is an alternative syntax for the WebAssembly text format : It's JavaScript with rules.**

Walt files compile directly to WebAssembly binary format.

<what-animation></what-animation>

---


### Walt does all the chemistry

* No C/C++ or Rust required, just typed JavaScript.
* NO LLVM/binary toolkits required, zero dependencies.
* Fast compilation, integrates into webpack!

**Here is a simple WALT function:**

```js
export function fibonacci(n: i32): i32 {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

<footer>

### Let's get started !

| Try Walt in the browser                             | Dive in the documentation                       | Come see us on GitHub                                  |
|-----------------------------------------------------|-------------------------------------------------|--------------------------------------------------------|
| See how it compiles to the WebAssembly text format. | Walt is one npm command away from your machine. | Walt is an open-source project, open to contributions. |
| [Live demo](/demo)                                  | [Docs](/docs)                                   | [GitHub](https://github.com/ballercat/walt)            |

</footer>