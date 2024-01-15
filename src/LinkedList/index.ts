import { type Thunk, toThunk, UnwrapThunk } from "../Thunk";
import { deepCopy } from "../utils/Clone";

export class LinkedListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "[lazy-thunk] LinkedListError";
  }
}

type Node<T extends Thunk<unknown>> = {
  head: T;
  rest: LazyList<T>;
};
export type LazyList<T extends Thunk<unknown>> = Thunk<Node<T> | null>;

type Element<T> = T extends (infer U)[] ? U : T;
type IntoLazyList<T> = T extends (infer U)[] ? LazyList<IntoLazyList<U>> : Thunk<T>;
type IntoArray<T> = T extends LazyList<infer U> ? IntoArray<U>[] : UnwrapThunk<T>;

export const isLazyList = <T extends Thunk<unknown>>(x: unknown): x is LazyList<T> => {
  if (typeof x !== "function") {
    return false;
  }
  const result = x();
  return (
    result === null ||
    (typeof result.head === "function" && typeof result.rest === "function")
  );
};

/**
 * Convert a JS array to a lazy list.
 * @param xs a JS array to be converted
 * @returns a lazy list converted from the given array
 */
export const fromArray = <T>(_xs: T[]): LazyList<IntoLazyList<T>> => {
  const xs = deepCopy(_xs);
  return () => {
    if (xs.length <= 0) {
      return null;
    }
    if (Array.isArray(xs[0])) {
      return {
        head: fromArray<Element<T>>(xs[0]) as IntoLazyList<T>,
        rest: fromArray<T>(xs.slice(1)),
      };
    }
    return {
      head: (() => xs[0]) as IntoLazyList<T>,
      rest: fromArray<T>(xs.slice(1)),
    };
  };
};

/**
 * WARNING: Converting an infinite list to an array results in
 * `Fatal JavaScript invail size error`.
 *
 * NOTE: This function breaks immutability in favor of performance.
 * @summary Convert a lazy list into a JS array.
 */
export const unsafeToArray = <T extends Thunk<unknown>>(
  xs: LazyList<T>,
): IntoArray<LazyList<T>> => {
  const arr = [];
  let node = xs();
  while (node !== null) {
    arr.push(isLazyList(node.head) ? unsafeToArray(node.head) : node.head());
    node = node.rest();
  }
  return arr as IntoArray<LazyList<T>>;
};

/**
 * NOTE: This fuction cannot simply use buffer to write something to console,
 * because an infinite lazy list can be given.
 * @param xs an lazy list
 * @summary Print each items in the given lazy list line by line.
 */
export const printList = <T extends Thunk<unknown>>(xs: LazyList<T>) => {
  let node = xs();
  while (node !== null) {
    const h = node.head;
    if (isLazyList(h)) {
      printList(h);
    } else {
      console.log(h());
    }
    node = node.rest();
  }
};

/**
 * WARNING: Converting an infinite list to an array results in
 * `Fatal JavaScript invail size error`.

 * @summary Convert a lazy list into a JS array.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unsafeToArray = <T extends Thunk<UnwrapThunk<T>>>(
  xs: LazyList<T>,
): UnwrapThunk<T>[] => {
  const __toArray = (xs: LazyList<T>, acc: UnwrapThunk<T>[]): UnwrapThunk<T>[] => {
    const node = xs();
    if (node !== null) {
      acc.push(node.head());
      return __toArray(node.rest, acc);
    }
    return acc;
  };
  return __toArray(xs, []);
};

export const infRange = (start: number): LazyList<Thunk<number>> => {
  return () => ({
    head: () => start,
    rest: infRange(start + 1),
  });
};

/**
 * Generate a lazy list bounded by given parameters.
 * If `end` is not given, it generates an infinite lazy list.
 * @param start a start bound
 * @param end an optional end bound
 * @returns a lazy list bounded to [start, end)
 */
export const range = (start: number, end?: number): LazyList<Thunk<number>> => {
  if (end === undefined) {
    return infRange(start);
  }
  return () => (start < end ? { head: () => start, rest: range(start + 1, end) } : null);
};

export const take = <T extends Thunk<unknown>>(
  n: number,
  xs: LazyList<T>,
): LazyList<T> => {
  return () => {
    const node = xs();
    if (node === null || n <= 0) {
      return null;
    }
    return {
      head: node.head,
      rest: take(n - 1, node.rest),
    };
  };
};

export const map = <T extends Thunk<unknown>, U extends Thunk<unknown>>(
  f: (x: T) => U,
  xs: LazyList<T>,
): LazyList<U> => {
  return () => {
    const node = xs();
    if (node === null) {
      return null;
    }
    return {
      head: f(node.head),
      rest: map(f, node.rest),
    };
  };
};

export const filter = <T extends Thunk<unknown>>(
  predicate: (x: T) => boolean,
  xs: LazyList<T>,
): LazyList<T> => {
  return () => {
    const node = xs();
    if (node === null) {
      return null;
    }
    const val = node.head;
    if (predicate(val)) {
      return {
        head: val,
        rest: filter(predicate, node.rest),
      };
    }
    return filter(predicate, node.rest)();
  };
};

/**
 * NOTE: Because JS runtime does not optimize recursive calls,
 * this function can easily end up with stack overflow.
 * @desc
 * Fold the given list from the right with the function and return the accumulated result.
 * @param f a function to operate each folding
 * @param acc an initial value of the folded result
 * @param xs a list to fold
 * @returns the accumulated result which has same type with acc
 */
export const _foldr = <T extends Thunk<unknown>, U extends Thunk<unknown>>(
  f: (x: T, acc: U) => U,
  acc: U,
  xs: LazyList<T>,
): U => {
  const node = xs();
  if (node === null) {
    return acc;
  }
  return f(node.head, _foldr(f, acc, node.rest));
};

/**
 * NOTE: Because JS runtime does not optimize recursive calls,
 * this function can easily end up with stack overflow.
 * @desc
 * Fold the given list from the left with the function and return the accumulated result.
 * @param f a function to operate each folding
 * @param acc an initial value of the folded result
 * @param xs a list to fold
 * @returns the accumulated result which has same type with acc
 */
export const _foldl = <T extends Thunk<unknown>, U extends Thunk<unknown>>(
  f: (acc: U, x: T) => U,
  acc: U,
  xs: LazyList<T>,
): U => {
  const node = xs();
  if (node === null) {
    return acc;
  }
  return _foldl(f, f(acc, node.head), node.rest);
};

/**
 * NOTE: This function is while-loop version of _foldl, which avoids stack overflow.
 * @see {@link _foldl}
 * @see {@link _foldr}
 * @desc
 * Fold the given list from the right with the function and return the accumulated result.
 * @param f a function to operate each folding
 * @param init an initial value of the folded result
 * @param xs a list to fold
 * @returns the accumulated result which has same type with acc
 */
export const fold = <T extends Thunk<unknown>, U extends Thunk<unknown>>(
  f: (acc: U, x: T) => U,
  init: U,
  xs: LazyList<T>,
): U => {
  let acc = init;
  let node = xs();
  while (node !== null) {
    acc = f(acc, node.head);
    node = node.rest();
  }
  return acc;
};

export const head = <T extends Thunk<unknown>>(xs: LazyList<T>): T => {
  const node = xs();
  if (node === null) {
    throw new LinkedListError("Exception: empty list");
  }
  return node.head;
};

export const last = <T extends Thunk<unknown>>(xs: LazyList<T>): T => {
  let lastValue;
  let node = xs();
  if (node === null) {
    throw new LinkedListError("last: empty list");
  }
  while (node !== null) {
    lastValue = node.head;
    node = node.rest();
  }
  return lastValue as T;
};

export const tail = <T extends Thunk<unknown>>(xs: LazyList<T>): LazyList<T> => {
  const node = xs();
  if (node === null) {
    throw new LinkedListError("tail: empty list");
  }
  return () => {
    const nextNode = node.rest();
    if (nextNode === null) {
      return null;
    }
    return {
      head: nextNode.head,
      rest: nextNode.rest,
    };
  };
};

export const init = <T extends Thunk<unknown>>(xs: LazyList<T>): LazyList<T> => {
  const node = xs();
  if (node === null) {
    throw new LinkedListError("init: empty list");
  }
  return () => {
    const r = node.rest();
    if (r === null) {
      return null;
    }
    return {
      head: node.head,
      rest: init(node.rest),
    };
  };
};

export const at = <T extends Thunk<unknown>>(xs: LazyList<T>, idx: number): T => {
  if (idx < 0) {
    throw new LinkedListError("at: negative index");
  }
  let result;
  let node = xs();
  for (let i = 0; i <= idx; i++) {
    if (node === null) {
      throw new LinkedListError("at: index too large");
    }
    result = node.head;
    node = node.rest();
  }
  return result as T;
};

export const prepended = <T extends U, U extends Thunk<unknown>>(
  value: T,
  xs: LazyList<U>,
): LazyList<U> => {
  return () => ({
    head: value,
    rest: xs,
  });
};

export const pushed = <T extends U, U extends Thunk<unknown>>(
  value: T,
  xs: LazyList<U>,
): LazyList<U> => {
  return () => {
    const node = xs();
    if (node === null) {
      return {
        head: value,
        rest: toThunk(null),
      };
    }
    return {
      head: node.head,
      rest: pushed(value, node.rest),
    };
  };
};

export const isEqual = <T extends Thunk<unknown>>(
  xs: LazyList<T>,
  ys: LazyList<T>,
): boolean => {
  let xNode = xs();
  let yNode = ys();
  while (xNode !== null && yNode !== null) {
    const xHead = xNode.head;
    const yHead = yNode.head;
    if (isLazyList(xHead) && isLazyList(yHead)) {
      if (!isEqual(xHead, yHead)) {
        return false;
      }
    } else if (!isLazyList(xHead) && !isLazyList(yHead)) {
      if (!Object.is(xHead(), yHead())) {
        return false;
      }
    } else {
      return false;
    }
    xNode = xNode.rest();
    yNode = yNode.rest();
  }
  return xNode === null && yNode === null ? true : false;
};

export const isEmpty = <T extends Thunk<unknown>>(xs: LazyList<T>): boolean => {
  return xs() === null ? true : false;
};
