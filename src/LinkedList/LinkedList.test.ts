import { describe, expect, it } from "@jest/globals";
import { Expect, Equal } from "../../test/helper";
import { Thunk, toThunk } from "../Thunk";
import * as LL from ".";

const STACK_OVERFLOW_BOUND = 1000000;

const range = (start: number, end: number): number[] => {
  const arr: number[] = [];
  for (let i = start; i < end; i++) {
    arr.push(i);
  }
  return arr;
};

expect.addEqualityTesters([]);

describe("fromArray:", () => {
  it("should generate Thunk<null> when an empty array is given", () => {
    expect(LL.fromArray([])()).toEqual(null);
  });
});

describe("unsafeToArray:", () => {
  it("should return null when empty lazy list is given", () => {
    expect(LL.unsafeToArray(LL.fromArray([]))).toEqual([]);
  });
});

describe("general conversions:", () => {
  it("should maintain consistency when converting from array to linked list and back", () => {
    expect(LL.unsafeToArray(LL.fromArray([1, 2, 3]))).toEqual([1, 2, 3]);
  });
  it("should let TypeScript compiler infer types properly even with nested structures", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    ({}) as Expect<
      Equal<LL.LazyList<LL.LazyList<LL.LazyList<Thunk<number>>>>, typeof xsss>
    >;
    expect(1).toBe(1);
  });
  it("should work recursively so that nested structure is consistently preserved", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    const result = [
      [[1], [2]],
      [[3], [4]],
    ];
    expect(LL.unsafeToArray(xsss)).toEqual(result);
  });
  it("should not be impacted by mutating inner fields of the orignal array", () => {
    const given = [
      [[1], [2]],
      [[3], [4]],
    ];
    const xsss = LL.fromArray(given);
    given[0][0][0] = 1000;
    const result = [
      [[1], [2]],
      [[3], [4]],
    ];
    expect(LL.unsafeToArray(xsss)).toEqual(result);
  });
});

describe("isLazyList:", () => {
  it("should return true when the given argument is a LazyList", () => {
    const xs = LL.fromArray([]);
    const ys = LL.range(0, 10);
    const zs = LL.fromArray([[], []]);
    expect(LL.isLazyList(xs)).toBe(true);
    expect(LL.isLazyList(ys)).toBe(true);
    expect(LL.isLazyList(zs)).toBe(true);
  });
  it("should return false when the given argument is not a function", () => {
    [{}, { head: () => 7, rest: () => null }, [], "Hello, World!", 1, true].forEach(
      (val) => {
        expect(LL.isLazyList(val)).toBe(false);
      },
    );
  });
});

describe("range:", () => {
  it("should generate a properly bounded `[)` lazy list", () => {
    const xs = LL.range(3, 7);
    const result = [3, 4, 5, 6];
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should return empty list if start >= end", () => {
    const xs = LL.range(7, 3);
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
});

describe("take:", () => {
  it("should take exact amount of the given n", () => {
    const xs = LL.fromArray("Hello, World!".split(""));
    const subXs = LL.take(4, xs);
    const result = "Hell".split("");
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should return empty list if the given list is empty", () => {
    const xs = LL.fromArray([]);
    const subXs = LL.take(100, xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);
  });
  it("should not return more than the length of list", () => {
    const xs = LL.fromArray([0, 1, 2, 3]);
    const subXs = LL.take(100, xs);
    const result = [0, 1, 2, 3];
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should work with an infinite list", () => {
    const xs = LL.range(0);
    const subXs = LL.take(4, xs);
    const result = [0, 1, 2, 3];
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should take nothing when the given n is less than 1", () => {
    const xs = LL.range(0);
    let subXs = LL.take(0, xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);

    subXs = LL.take(-1, xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);
  });
  it("should take LazyList if a nested list is given", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    const ysss = LL.take(1, xsss);
    const result = [[[1], [2]]];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("filter:", () => {
  it("should properly filter elements by predicate", () => {
    const isEven = (e: number) => e % 2 === 0;
    const isEvenT = (e: Thunk<number>) => e() % 2 === 0;
    const length = 7;
    const xs = LL.range(0, length);
    const result = [0, 1, 2, 3, 4, 5, 6].filter(isEven);
    expect(LL.unsafeToArray(LL.filter(isEvenT, xs))).toEqual(result);
  });
  it("should return an empty list if all the elements violates the predicate", () => {
    const isSpaceT = (e: Thunk<string>) => e() === " ";
    const xs = LL.filter(isSpaceT, LL.fromArray("Hello!".split("")));
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
  it("should work with an infinite list", () => {
    const isOdd = (e: number) => e % 2 === 1;
    const isOddT = (e: Thunk<number>) => e() % 2 === 1;
    const length = 5;
    const xs = LL.take(length, LL.filter(isOddT, LL.range(0)));
    const result = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(isOdd);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should evaluate the given predicate lazily", () => {
    const generateErr = <T>(_: T) => {
      void _;
      throw new Error("ERROR!");
    };
    const test = () => {
      return LL.filter(generateErr, LL.range(0, 10));
    };
    expect(test).not.toThrow();
  });
});

describe("map:", () => {
  it("should properly map elements by the given function", () => {
    const square = (e: number) => e * e;
    const squareT = (e: Thunk<number>) => toThunk(e() * e());
    const length = 7;
    const xs = LL.map(squareT, LL.range(0, length));
    const result = range(0, length).map(square);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should return an empty list if the given list is empty", () => {
    const xs = LL.map((_) => toThunk((void _, undefined)), LL.fromArray([]));
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
  it("should work with an infinite list", () => {
    const f = <T>(_: T) => (void _, "HACKED");
    const fT = <T>(_: T) => toThunk((void _, "HACKED"));
    const length = 10;
    const xs = LL.take(length, LL.map(fT, LL.range(0)));
    const result = range(0, length).map(f);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should evaluate the given function lazily", () => {
    const generateErr = <T>(_: T) => {
      void _;
      throw new Error("ERROR!");
    };
    const test = () => {
      return LL.map(generateErr, LL.range(0, 10));
    };
    expect(test).not.toThrow();
  });
  it("should work properly with a nested list", () => {
    const f = (xs: LL.LazyList<Thunk<number>>): LL.LazyList<Thunk<number>> => {
      return LL.prepended(toThunk(100), xs);
    };
    const xss = LL.fromArray<number[]>([
      [2, 3],
      [4, 5],
    ]);
    const yss = LL.map(f, xss);
    const result = [
      [100, 2, 3],
      [100, 4, 5],
    ];
    expect(LL.unsafeToArray(yss)).toEqual(result);
  });
});

describe("_foldr:", () => {
  it("should properly fold elements by the given function", () => {
    const f = (acc: number, x: number) => x + acc;
    const fT = (x: Thunk<number>, acc: Thunk<number>) => toThunk(x() + acc());
    const length = 10;
    const xs = LL.range(0, length);
    const result = range(0, length).reduceRight(f, 0);
    expect(LL._foldr(fT, toThunk(0), xs)()).toEqual(result);
  });
  it("should return the given initial value if the given list is empty", () => {
    const fT = (acc: Thunk<string>, x: Thunk<string>) => toThunk(`${acc()} with ${x()}`);
    const xs = LL.fromArray([]);
    const result = "Hello, World!";
    expect(LL._foldr(fT, toThunk(result), xs)()).toEqual(result);
  });
});

describe("_foldl:", () => {
  it("should properly fold elements by the given function", () => {
    const f = (acc: number, x: number) => x + acc;
    const fT = (acc: Thunk<number>, x: Thunk<number>) => toThunk(x() + acc());
    const length = 10;
    const xs = LL.range(0, length);
    const result = range(0, length).reduce(f, 0);
    expect(LL._foldl(fT, toThunk(0), xs)()).toEqual(result);
  });
  it("should return the given initial value if the given list is empty", () => {
    const fT = (acc: Thunk<string>, x: Thunk<string>) => toThunk(`${acc()} with ${x()}`);
    const xs = LL.fromArray([]);
    const result = "Hello, World!";
    expect(LL._foldl(fT, toThunk(result), xs)()).toEqual(result);
  });
});

describe("fold:", () => {
  it("should properly fold elements by the given function", () => {
    const f = (acc: number, x: number) => x + acc;
    const fT = (acc: Thunk<number>, x: Thunk<number>) => toThunk(x() + acc());
    const length = 10;
    const xs = LL.range(0, length);
    const result = range(0, length).reduce(f, 0);
    expect(LL.fold(fT, toThunk(0), xs)()).toEqual(result);
  });
  it("should return the given initial value if the given list is empty", () => {
    const fT = (acc: Thunk<string>, x: Thunk<string>) => toThunk(`${acc()} with ${x()}`);
    const xs = LL.fromArray([]);
    const result = "Hello, World!";
    expect(LL.fold(fT, toThunk(result), xs)()).toEqual(result);
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const fT = (acc: Thunk<number>, x: Thunk<number>) => toThunk(x() + acc());
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.range(0, length);
      return LL.fold(fT, toThunk(0), xs);
    };
    expect(test).not.toThrow(RangeError);
  });
});

describe("head:", () => {
  it("should properly take 1st element", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const result = range(0, length)[0];
    expect(LL.head(xs)()).toEqual(result);
  });
  it("should throw LinkedListError when an empty list is given", () => {
    const test = () => {
      const xs = LL.fromArray([]);
      return LL.head(xs);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("empty list");
  });
  it("should return LazyList if a nested list is given", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    const ysss = LL.head(xsss);
    const result = [[1], [2]];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("last:", () => {
  it("should properly return the last element", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const result = range(0, length)[length - 1];
    expect(LL.last(xs)()).toEqual(result);
  });
  it("should throw LinkedListError when an empty list is given", () => {
    const test = () => {
      const xs = LL.fromArray([]);
      return LL.last(xs);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("empty list");
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.range(0, length);
      return LL.last(xs);
    };
    expect(test).not.toThrow(RangeError);
  });
  it("should return LazyList if a nested list is given", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    const ysss = LL.last(xsss);
    const result = [[3], [4]];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("tail:", () => {
  it("should properly return a list without the first element", () => {
    const length = 10;
    const xs = LL.tail(LL.range(0, length));
    const result = range(0, length).slice(1);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should throw LinkedListError when an empty list is given", () => {
    const test = () => {
      const xs = LL.fromArray([]);
      return LL.tail(xs);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("empty list");
  });
  it("should return nested LazyList if a nested list is given", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
      [[5], [6]],
    ]);
    const ysss = LL.tail(xsss);
    const result = [
      [[3], [4]],
      [[5], [6]],
    ];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("init:", () => {
  it("should properly return a list without the last element", () => {
    const length = 10;
    const xs = LL.init(LL.range(0, length));
    const result = range(0, length).slice(0, length - 1);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should throw LinkedListError when an empty list is given", () => {
    const test = () => {
      const xs = LL.fromArray([]);
      return LL.init(xs);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("empty list");
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.range(0, length);
      return LL.init(xs);
    };
    expect(test).not.toThrow(RangeError);
  });
  it("should return nested LazyList if a nested list is given", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
      [[5], [6]],
    ]);
    const ysss = LL.init(xsss);
    const result = [
      [[1], [2]],
      [[3], [4]],
    ];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("at:", () => {
  it("should properly return an element at the given index", () => {
    const length = 10;
    const idx = 5;
    const xs = LL.range(0, length);
    const result = range(0, length)[idx];
    expect(LL.at(xs, idx)()).toEqual(result);
  });
  it("should throw LinkedListError when a negative index is given", () => {
    const test = () => {
      const length = 10;
      const idx = -1;
      const xs = LL.range(0, length);
      return LL.at(xs, idx);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("negative index");
  });
  it("should throw LinkedListError when the given index >= length of the list", () => {
    const test = () => {
      const idx = 0;
      const xs = LL.fromArray([]);
      return LL.at(xs, idx);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("index too large");
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.range(0, length);
      return LL.at(xs, length - 1);
    };
    expect(test).not.toThrow(RangeError);
  });
  it("should return LazyList if a nested list is given", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
      [[5], [6]],
    ]);
    const ysss = LL.at(xsss, 1);
    const result = [[3], [4]];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("prepended:", () => {
  it("should properly prepend the given value", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const ys = LL.prepended(toThunk(-1), xs);
    const result = range(0, length);
    result.unshift(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should properly work with an empty list", () => {
    const xs = LL.fromArray([] as number[]);
    const ys = LL.prepended(toThunk(-1), xs);
    const result: number[] = [];
    result.unshift(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with multiple prepends", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const ys = LL.prepended(
      toThunk(-3),
      LL.prepended(toThunk(-2), LL.prepended(toThunk(-1), xs)),
    );
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.unshift(e));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with different list operations", () => {
    const isOdd = (e: number) => e % 2 === 1;
    const isOddT = (e: Thunk<number>) => e() % 2 === 1;
    const length = 20;
    const xs = LL.prepended(toThunk(1), LL.prepended(toThunk(2), LL.range(3, length)));
    const result = range(3, length);
    result.unshift(2);
    result.unshift(1);
    expect(LL.unsafeToArray(LL.filter(isOddT, xs))).toEqual(result.filter(isOdd));
  });
  it("should work properly with an infinite list", () => {
    const xs = LL.range(0);
    const [i, j] = [-1, -2];
    const ys = LL.prepended(toThunk(j), LL.prepended(toThunk(i), xs));
    const y1 = LL.head(ys);
    const y2 = LL.at(ys, 1);
    expect(y1()).toEqual(j);
    expect(y2()).toEqual(i);
  });
  it("should not touch the original list", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const ys = LL.prepended(
      toThunk(-3),
      LL.prepended(toThunk(-2), LL.prepended(toThunk(-1), xs)),
    );
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.unshift(e));
    expect(LL.unsafeToArray(xs)).toEqual(range(0, length));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should properly prepend a LazyList to a nested LazyList", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
      [[5], [6]],
    ]);
    const ysss = LL.prepended(LL.fromArray([[-1, 0]]), xsss);
    const result = [[[-1, 0]], [[1], [2]], [[3], [4]], [[5], [6]]];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("pushed:", () => {
  it("should properly push the given value", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const ys = LL.pushed(toThunk(-1), xs);
    const result = range(0, length);
    result.push(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should properly work with an empty list", () => {
    const xs = LL.fromArray([] as number[]);
    const ys = LL.pushed(toThunk(-1), xs);
    const result: number[] = [];
    result.unshift(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with multiple pushes", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const ys = LL.pushed(toThunk(-3), LL.pushed(toThunk(-2), LL.pushed(toThunk(-1), xs)));
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.push(e));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with different list operations", () => {
    const isOdd = (e: number) => e % 2 === 1;
    const isOddT = (e: Thunk<number>) => e() % 2 === 1;
    const length = 20;
    const xs = LL.pushed(toThunk(21), LL.pushed(toThunk(20), LL.range(3, length)));
    const result = range(3, length);
    result.push(20);
    result.push(21);
    expect(LL.unsafeToArray(LL.filter(isOddT, xs))).toEqual(result.filter(isOdd));
  });
  it("should not touch the original list", () => {
    const length = 10;
    const xs = LL.range(0, length);
    const ys = LL.pushed(toThunk(-3), LL.pushed(toThunk(-2), LL.pushed(toThunk(-1), xs)));
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.push(e));
    expect(LL.unsafeToArray(xs)).toEqual(range(0, length));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should properly push a LazyList to a nested LazyList", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
      [[5], [6]],
    ]);
    const ysss = LL.pushed(LL.fromArray([[7, 8]]), xsss);
    const result = [[[1], [2]], [[3], [4]], [[5], [6]], [[7, 8]]];
    expect(LL.unsafeToArray(ysss)).toEqual(result);
  });
});

describe("isEqual:", () => {
  it("should properly check shallow equality", () => {
    const xs = LL.range(0, 5);
    const ys = LL.range(0, 5);
    const diffs = LL.range(-1, 4);
    expect(LL.isEqual(xs, ys)).toBe(true);
    expect(LL.isEqual(xs, diffs)).toBe(false);
    expect(LL.isEqual(ys, diffs)).toBe(false);
  });
  it("should be commutative", () => {
    const xs = LL.range(0, 5);
    const ys = LL.range(0, 5);
    const diffs = LL.range(-1, 4);
    expect(LL.isEqual(ys, xs)).toBe(true);
    expect(LL.isEqual(diffs, xs)).toBe(false);
    expect(LL.isEqual(diffs, ys)).toBe(false);
  });
  it("should properly check deep equality", () => {
    const xsss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    const ysss = LL.fromArray([
      [[1], [2]],
      [[3], [4]],
    ]);
    const diffsss = LL.fromArray([
      [[0], [2]],
      [[3], [4]],
    ]);
    expect(LL.isEqual(xsss, ysss)).toBe(true);
    expect(LL.isEqual(xsss, diffsss)).toBe(false);
    expect(LL.isEqual(ysss, diffsss)).toBe(false);
  });
  it("should return false when one element is LazyList but the other is not", () => {
    const xs = LL.fromArray([
      [1, 2],
      [3, 4],
    ]);
    const ys = LL.fromArray([1, 2, 3, 4]);
    // @ts-expect-error type incompatibility also checked by TypeScript compiler
    expect(LL.isEqual(xs, ys)).toBe(false);
  });
  it("should properly detect length difference", () => {
    const xs = LL.range(0, 5);
    const ys = LL.range(0, 6);
    const xss = LL.fromArray([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    const yss = LL.fromArray([
      [1, 2],
      [3, 4],
    ]);
    expect(LL.isEqual(xs, ys)).toBe(false);
    expect(LL.isEqual(xss, yss)).toBe(false);
  });
});

describe("isEmpty:", () => {
  it("should return true when empty list is given", () => {
    const xs = LL.fromArray([]);
    expect(LL.isEmpty(xs)).toBe(true);
  });
  it("should return false when non-empty list is given", () => {
    const xs = LL.fromArray([false]);
    expect(LL.isEmpty(xs)).toBe(false);
  });
});

describe("length:", () => {
  it("should return the exact length of the list", () => {
    const length = 10;
    const xs = LL.range(0, 10);
    expect(LL.length(xs)).toEqual(length);
  });
  it("should return the length of outermost lists when a nested list is given", () => {
    const origin = [[[], []], [[]]];
    const length = origin.length;
    const xsss = LL.fromArray(origin);
    expect(LL.length(xsss)).toEqual(length);
  });
});

describe("reversed:", () => {
  it("should return the reversed version of the given list", () => {
    const xs = LL.reversed(LL.fromArray(range(1, 10)));
    const result = range(1, 10).reverse();
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should return empty list when an empty list is given", () => {
    const xs = LL.reversed(LL.fromArray([]));
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
  it("should return the same sequence when reversed twice", () => {
    const xs = LL.reversed(LL.reversed(LL.fromArray(range(1, 10))));
    const result = range(1, 10);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should reverse the outermost layer of list when a nested list is given", () => {
    const xs = LL.reversed(
      LL.fromArray([
        [[1], [2]],
        [[3], [4]],
      ]),
    );
    const result = [
      [[3], [4]],
      [[1], [2]],
    ];
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should not touch the original list", () => {
    const xs = LL.fromArray(range(1, 10));
    const ys = LL.reversed(xs);
    expect(LL.unsafeToArray(xs)).toEqual(range(1, 10));
    expect(LL.unsafeToArray(ys)).toEqual(range(1, 10).reverse());
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.range(0, length);
      return LL.reversed(xs);
    };
    expect(test).not.toThrow(RangeError);
  });
});
