import { type Thunk, toThunk } from "./Thunk";

type LazyList<T> = Thunk<{
  head: Thunk<T>;
  rest: LazyList<T>;
} | null>;

/**
 * Convert a JS array to a lazy list.
 * @param xs a JS array to be converted
 * @returns a lazy list converted from the given array
 */
const fromArray = <T>(xs: T[]): LazyList<T> => {
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
const unsafeToArray = <T>(xs: LazyList<T>): T[] => {
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
const _unsafeToArray = <T>(xs: LazyList<T>): T[] => {
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

const infRange = (start: Thunk<number>): LazyList<number> => {
  return () => ({
    head: start,
    // force to evalute start() + 1 first to avoid stack overflow
    rest: infRange(toThunk(start() + 1)),
  });
};
const $infRange = (start: number): LazyList<number> => {
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
const range = (start: Thunk<number>, end?: Thunk<number>): LazyList<number> => {
  if (end === undefined) {
    return infRange(start);
  }
  return () =>
    // force to evalute start() + 1 first to avoid stack overflow
    start() < end() ? { head: start, rest: range(toThunk(start() + 1), end) } : null;
};
const $range = (start: number, end?: number): LazyList<number> => {
  if (end === undefined) {
    return $infRange(start);
  }
  return () => (start < end ? { head: () => start, rest: $range(start + 1, end) } : null);
};

const $take = <T>(n: number, xs: LazyList<T>): LazyList<T> => {
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
const take = <T>(n: Thunk<number>, xs: LazyList<T>): LazyList<T> => {
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

/**
 * NOTE: This fuction cannot simply use buffer to write something to console,
 * because an infinite lazy list can be given.
 * @param xs an lazy list
 * @summary Print each items in the given lazy list line by line.
 */
const printList = <T>(xs: LazyList<T>) => {
  let node = xs();
  while (node !== null) {
    console.log(node.head());
    node = node.rest();
  }
};

export {
  type LazyList,
  fromArray,
  unsafeToArray,
  _unsafeToArray,
  range,
  $range,
  printList,
  $take,
  take,
};
