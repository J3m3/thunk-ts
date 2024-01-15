export type Thunk<T> = () => T;
export type UnwrapThunk<T> = T extends Thunk<infer U> ? U : never;

/**
 * IMPORTANT: To guarantee that this function works as intended,
 * you have to pass ___ONLY SINGLE___ literal value.
 * Otherwise, lazy evaluation would not work as you intended,
 * because JS runtimes evaluate expressions eagerly by default.
 *
 * NOTE: This function does not deep-copy the given argument.
 * This means that the thunk returned by `toThunk` can be impacted
 * by changes of inner fields of original referenced value.
 *
 * To safely wrap some expressions into Thunk,
 * please use a function which returns that expression (i.e. `() => 3 + 7`).
 *
 * So what is the purpose of this contrained function?
 * With it, you can force the given expression evaluated first.
 * This is useful when runtime error (i.e. stack overflow) occurs in recursion.
 * @example
 * // returns () => 1
 * const x = toThunk(1)
 * @example
 * // This returns () => 6, NOT () => 3 + 3,
 * // because JS runtimes evaluate `3 + 3` first.
 * const x = toThunk(3 + 3)
 * @param x Any single literal value to be wrapped
 * @returns A function that wraps the given value
 */
export const toThunk = <T>(x: T): Thunk<T> => {
  return () => x;
};
