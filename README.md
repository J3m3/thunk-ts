# lazy-thunk

[![NPM Version](https://img.shields.io/npm/v/lazy-thunk)](https://www.npmjs.com/package/lazy-thunk)
[![CI](https://github.com/J3m3/lazy-thunk/actions/workflows/ci.yml/badge.svg)](https://github.com/J3m3/lazy-thunk/actions/workflows/ci.yml)
[![Release](https://github.com/J3m3/lazy-thunk/actions/workflows/release.yml/badge.svg)](https://github.com/J3m3/lazy-thunk/actions/workflows/release.yml)

> A set of data structures in TypeScript which utilizes lazy evaluation (w/o 3rd party dependencies!)

`lazy-thunk` emulates lazy evaluation simply by wrapping expressions into a function.

## Simple Examples

```ts
import { type Thunk, toThunk } from "lazy-thunk";
import * as LL from "lazy-thunk/LinkedList";

// an infinite list of even numbers
const isEven = (n: Thunk<number>) => n() % 2 === 0;
const evens = LL.filter(isEven, LL.range(1));
const xs = LL.unsafeToArray(LL.take(5, evens)); // [2, 4, 6, 8, 10]

// an infinite list of prime numbers
const sieve = (xs: LL.LazyList<Thunk<number>>): LL.LazyList<Thunk<number>> => {
  return () => {
    const node = xs();
    if (node === null) {
      return null;
    }
    const h = node.head;
    return {
      head: h,
      rest: sieve(LL.filter((n) => n() % h() !== 0, node.rest)),
    };
  };
};
const primes = sieve(LL.range(2));
const ys = LL.unsafeToArray(LL.take(5, primes)); // [2, 3, 5, 7, 11]
```

## Installation

```console
npm i lazy-thunk
```

> [!WARNING]
> If you want to work with CJS modules, you should make sure that `module` field in `tsconfig.json` is set to `node16` or `nodenext` like below. (`module: commonjs` does not work properly with `lazy-thunk`, and [is even not recommended](https://www.typescriptlang.org/docs/handbook/modules/reference.html#commonjs))

```json
{
  "compilerOptions": {
    "module": "node16"
    // ...
  }
  // ...
}
```

## API

TODO

## About Naming

### Package

A [`thunk`](https://wiki.haskell.org/Thunk) is a term used in Haskell, which denotes value that is yet to be evaluated.

> [!IMPORTANT]
> lazy-thunk does not strictly emulates `thunk` in Haskell. Haskell evaluates expressions up to [WHNF (Weak Head Normal Form)](https://wiki.haskell.org/Weak_head_normal_form).

## References

- HaskellWiki: https://wiki.haskell.org/
- Basic idea comes from: https://youtu.be/E5yAoMaVCp0?si=slYqwH_GDHVTm-Ty

## License

This project is licensed under the terms of the [MIT License](LICENSE).
