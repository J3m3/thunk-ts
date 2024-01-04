# thunk-ts

> A set of data structures in TypeScript which utilizes lazy evaluation

## Installation

```console
npm i thunk-ts -D
```

## API

TODO

## About Naming

### Package

A [`thunk`](https://wiki.haskell.org/Thunk) is a term used in haskell, which denotes value that is yet to be evaluated.

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

## References

- HaskellWiki: https://wiki.haskell.org/

## License

This project is licensed under the terms of the [MIT License](LICENSE).
