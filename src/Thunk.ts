type Thunk<T> = () => T;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;

/**
 * IMPORTANT: To guarantee that this function works properly,
 * you have to pass ___ONLY SINGLE___ primitive value.
 * Otherwise, lazy evaluation would not work as you intended,
 * because JS runtimes evaluate expressions eagerly by default.
 *
 * This function may work as you intended in some other situations without Primitive types (i.e. callbacks),
 * but I keep it contrained for simplicity.
 * To safely wrap some expressions into Thunk,
 * please use a function which returns that expression.
 *
 * So what is the purpose of this contrained function?
 * With it, you can force the given expression evaluated first.
 * This is useful when runtime error (i.e. stack overflow) occurs in recursion.
 * @example
 * // returns () => 1
 * const x = toThunk(1)
 * @example
 * // This returns () => 6, NOT () => 3 + 3, because JS runtimes evaluate `3 + 3` first.
 * // This might cause critical issues while performing recursions (i.e. infinite recursion).
 * const x = toThunk(3 + 3)
 * @param x Any primitive value to be wrapped
 * @returns A function that wraps the given value
 */
const toThunk = <T extends Primitive>(x: T): Thunk<T> => {
  return () => x;
};

export { type Thunk, toThunk };
