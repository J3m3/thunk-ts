# thunk-ts

> A set of data structures in TypeScript which utilizes lazy evaluation (w/o 3rd party dependencies!)

`thunk-ts` emulates lazy evaluation simply by wrapping expressions into a function.

## Simple Examples

```ts
import { toThunk } from "ts-thunk";
import * as LL from "ts-thunk/LinkedList";

// an infinite list of even numbers
const isEven = (n: number) => n % 2 === 0;
const evens = LL.$filter(isEven, LL.$range(1));
const xs = LL.unsafeToArray(LL.$take(5, evens)); // [2, 4, 6, 8, 10]

// an infinite list of prime numbers
const sieve = (xs: LL.LazyList<number>): LL.LazyList<number> => {
  return () => {
    const node = xs();
    if (node === null) {
      return null;
    }
    const x = node.head();
    return {
      head: toThunk(x),
      rest: sieve(LL.$filter((n) => n % x !== 0, node.rest)),
    };
  };
};
const primes = sieve(LL.$range(2));
const ys = LL.unsafeToArray(LL.$take(5, primes)); // [2, 3, 5, 7, 11]
```

## Installation

```console
npm i thunk-ts
```

## API

TODO

## About Naming

### Package

A [`thunk`](https://wiki.haskell.org/Thunk) is a term used in Haskell, which denotes value that is yet to be evaluated.

> [!IMPORTANT]
> thunk-ts does not strictly emulates `thunk` in Haskell. Haskell evaluates expressions up to [WHNF (Weak Head Normal Form)](https://wiki.haskell.org/Weak_head_normal_form).

### Functions

`$` prefix denotes `semi`. You can call $-prefixed util functions with primitive values which are not wrapped in `Thunk`. For instance:

```ts
import { toThunk } from "ts-thunk";
import * as LL from "ts-thunk/LinkedList";

// An infinite list which contains [0..]
const $r = LL.$range(0);

// equivalent to above
const r = LL.range(toThunk(0));
```

> [!NOTE]
> You might prefer to use `$-prefixed` functions, because struggling explicitly with lazy stuffs is too cumbersome in the eager language, TypeScript. I will also implement `$-prefixed` functions first for this reason.

## References

- HaskellWiki: https://wiki.haskell.org/
- Basic idea comes from: https://youtu.be/E5yAoMaVCp0?si=slYqwH_GDHVTm-Ty

## License

This project is licensed under the terms of the [MIT License](LICENSE).
