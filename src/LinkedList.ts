import { type Thunk, toThunk } from "./Thunk";

export class LinkedListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "[ts-thunk] LinkedListError";
  }
}

export type LazyList<T> = Thunk<{
  head: Thunk<T>;
  rest: LazyList<T>;
} | null>;

/**
 * Convert a JS array to a lazy list.
 * @param xs a JS array to be converted
 * @returns a lazy list converted from the given array
 */
export const fromArray = <T>(xs: T[]): LazyList<T> => {
  return () =>
    xs.length > 0
      ? {
          head: () => xs[0],
          rest: fromArray(xs.slice(1)),
        }
      : null;
};

/**
 * WARNING: Converting an infinite list to an array results in
 * `Fatal JavaScript invail size error`.
 *
 * NOTE: This function breaks immutability in favor of performance.
 * @summary Convert a lazy list into a JS array.
 */
export const unsafeToArray = <T>(xs: LazyList<T>): T[] => {
  const arr = [];
  let node = xs();
  while (node !== null) {
    arr.push(node.head());
    node = node.rest();
  }
  return arr;
};

/**
 * WARNING: Converting an infinite list to an array results in
 * `Fatal JavaScript invail size error`.

 * @summary Convert a lazy list into a JS array.
 * @deprecated
 */
export const _unsafeToArray = <T>(xs: LazyList<T>): T[] => {
  const __toArray = (xs: LazyList<T>, acc: T[]): T[] => {
    const node = xs();
    if (node !== null) {
      acc.push(node.head());
      return __toArray(node.rest, acc);
    }
    return acc;
  };
  return __toArray(xs, []);
};

export const infRange = (start: Thunk<number>): LazyList<number> => {
  return () => ({
    head: start,
    // force to evalute start() + 1 first to avoid stack overflow
    rest: infRange(toThunk(start() + 1)),
  });
};
export const $infRange = (start: number): LazyList<number> => {
  return () => ({
    head: () => start,
    rest: $infRange(start + 1),
  });
};

/**
 * Generate a lazy list bounded by given parameters.
 * If `end` is not given, it generates an infinite lazy list.
 * @param start a start bound
 * @param end an optional end bound
 * @returns a lazy list bounded to [start, end)
 */
export const range = (start: Thunk<number>, end?: Thunk<number>): LazyList<number> => {
  if (end === undefined) {
    return infRange(start);
  }
  return () =>
    // force to evalute start() + 1 first to avoid stack overflow
    start() < end() ? { head: start, rest: range(toThunk(start() + 1), end) } : null;
};
export const $range = (start: number, end?: number): LazyList<number> => {
  if (end === undefined) {
    return $infRange(start);
  }
  return () => (start < end ? { head: () => start, rest: $range(start + 1, end) } : null);
};

export const take = <T>(n: Thunk<number>, xs: LazyList<T>): LazyList<T> => {
  return () => {
    const node = xs();
    if (node === null || n() <= 0) {
      return null;
    }
    return {
      head: node.head,
      rest: take(() => n() - 1, node.rest),
    };
  };
};
export const $take = <T>(n: number, xs: LazyList<T>): LazyList<T> => {
  return () => {
    const node = xs();
    if (node === null || n <= 0) {
      return null;
    }
    return {
      head: node.head,
      rest: $take(n - 1, node.rest),
    };
  };
};

export const $map = <T, U>(f: (x: T) => U, xs: LazyList<T>): LazyList<U> => {
  return () => {
    const node = xs();
    if (node === null) {
      return null;
    }
    const nx = f(node.head());
    return {
      head: () => nx,
      rest: $map(f, node.rest),
    };
  };
};

export const $filter = <T>(
  predicate: (x: T) => boolean,
  xs: LazyList<T>,
): LazyList<T> => {
  return () => {
    const node = xs();
    if (node === null) {
      return null;
    }
    const val = node.head();
    if (predicate(val)) {
      return {
        head: () => val,
        rest: $filter(predicate, node.rest),
      };
    }
    return $filter(predicate, node.rest)();
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
export const _$foldr = <T, U>(f: (x: T, acc: U) => U, acc: U, xs: LazyList<T>): U => {
  const node = xs();
  if (node === null) {
    return acc;
  }
  return f(node.head(), _$foldr(f, acc, node.rest));
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
export const $foldl = <T, U>(f: (acc: U, x: T) => U, acc: U, xs: LazyList<T>): U => {
  const node = xs();
  if (node === null) {
    return acc;
  }
  return $foldl(f, f(acc, node.head()), node.rest);
};

/**
 * NOTE: This function is while-loop version of _$foldl, which avoids stack overflow.
 * @see {@link $foldl}
 * @see {@link _$foldr}
 * @desc
 * Fold the given list from the right with the function and return the accumulated result.
 * @param f a function to operate each folding
 * @param init an initial value of the folded result
 * @param xs a list to fold
 * @returns the accumulated result which has same type with acc
 */
export const $fold = <T, U>(f: (acc: U, x: T) => U, init: U, xs: LazyList<T>): U => {
  let acc = init;
  let node = xs();
  while (node !== null) {
    const val = node.head();
    acc = f(acc, val);
    node = node.rest();
  }
  return acc;
};

export const $head = <T>(xs: LazyList<T>): T => {
  const node = xs();
  if (node === null) {
    throw new LinkedListError("Exception: empty list");
  }
  return node.head();
};

export const $last = <T>(xs: LazyList<T>): T => {
  let lastValue;
  let node = xs();
  if (node === null) {
    throw new LinkedListError("$last: empty list");
  }
  while (node !== null) {
    lastValue = node.head();
    node = node.rest();
  }
  return lastValue as T;
};

export const tail = <T>(xs: LazyList<T>): LazyList<T> => {
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

export const init = <T>(xs: LazyList<T>): LazyList<T> => {
  const node = xs();
  if (node === null) {
    throw new LinkedListError("init: empty list");
  }
  return () => {
    const h = node.head();
    const r = node.rest();
    if (r === null) {
      return null;
    }
    return {
      head: () => h,
      rest: init(node.rest),
    };
  };
};

export const $at = <T>(xs: LazyList<T>, idx: number): T => {
  if (idx < 0) {
    throw new LinkedListError("$at: negative index");
  }
  let result;
  let node = xs();
  for (let i = 0; i <= idx; i++) {
    if (node === null) {
      throw new LinkedListError("$at: index too large");
    }
    result = node.head();
    node = node.rest();
  }
  return result as T;
};

export const $prepended = <T>(value: T, xs: LazyList<T>): LazyList<T> => {
  return () => ({
    head: () => value,
    rest: xs,
  });
};

export const $pushed = <T>(value: T, xs: LazyList<T>): LazyList<T> => {
  return () => {
    const node = xs();
    if (node === null) {
      return {
        head: () => value,
        rest: toThunk(null),
      };
    }
    const x = node.head();
    return {
      head: () => x,
      rest: $pushed(value, node.rest),
    };
  };
};

/**
 * NOTE: This fuction cannot simply use buffer to write something to console,
 * because an infinite lazy list can be given.
 * @param xs an lazy list
 * @summary Print each items in the given lazy list line by line.
 */
export const printList = <T>(xs: LazyList<T>) => {
  let node = xs();
  while (node !== null) {
    console.log(node.head());
    node = node.rest();
  }
};
