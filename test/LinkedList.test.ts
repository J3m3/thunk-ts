import { describe, expect, it } from "@jest/globals";
import { toThunk } from "../src/Thunk";
import * as LL from "../src/LinkedList";

const STACK_OVERFLOW_BOUND = 10000000;

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
  it("should maintain consistency when converting from array to linked list and back", () => {
    expect(LL.unsafeToArray(LL.fromArray<number>([1, 2, 3]))).toEqual([1, 2, 3]);
  });
});

describe("range:", () => {
  it("should generate a properly bounded `[)` lazy list", () => {
    const xs = LL.range(toThunk(3), toThunk(7));
    const result = [3, 4, 5, 6];
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should return empty list if start >= end", () => {
    const xs = LL.range(toThunk(7), toThunk(3));
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
});
describe("$range:", () => {
  it("should generate a properly bounded `[)` lazy list", () => {
    const xs = LL.$range(3, 7);
    const result = [3, 4, 5, 6];
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should return empty list if start >= end", () => {
    const xs = LL.$range(7, 3);
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
});

describe("take:", () => {
  it("should take exact amount of the given n", () => {
    const xs = LL.fromArray<string>("Hello, World!".split(""));
    const subXs = LL.take(toThunk(4), xs);
    const result = "Hell".split("");
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should return empty list if the given list is empty", () => {
    const xs = LL.fromArray([]);
    const subXs = LL.take(toThunk(100), xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);
  });
  it("should not return more than the length of list", () => {
    const xs = LL.fromArray<number>([0, 1, 2, 3]);
    const subXs = LL.take(toThunk(100), xs);
    const result = [0, 1, 2, 3];
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should work with an infinite list", () => {
    const xs = LL.range(toThunk(0));
    const subXs = LL.take(toThunk(4), xs);
    const result = [0, 1, 2, 3];
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should take nothing when the given n is less than 1", () => {
    const xs = LL.range(toThunk(0));
    let subXs = LL.take(toThunk(0), xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);

    subXs = LL.take(toThunk(-1), xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);
  });
});
describe("$take:", () => {
  it("should take exact amount of the given n", () => {
    const xs = LL.fromArray<string>("Hello, World!".split(""));
    const subXs = LL.$take(4, xs);
    const result = "Hell".split("");
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should return empty list if the given list is empty", () => {
    const xs = LL.fromArray([]);
    const subXs = LL.$take(100, xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);
  });
  it("should not return more than the length of list", () => {
    const xs = LL.fromArray<number>([0, 1, 2, 3]);
    const subXs = LL.$take(100, xs);
    const result = [0, 1, 2, 3];
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should work with an infinite list", () => {
    const xs = LL.range(toThunk(0));
    const subXs = LL.$take(4, xs);
    const result = [0, 1, 2, 3];
    expect(LL.unsafeToArray(subXs)).toEqual(result);
  });
  it("should take nothing when the given n is less than 1", () => {
    const xs = LL.range(toThunk(0));
    let subXs = LL.$take(0, xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);

    subXs = LL.$take(-1, xs);
    expect(LL.unsafeToArray(subXs)).toEqual([]);
  });
});

describe("$filter:", () => {
  it("should properly filter elements by predicate", () => {
    const isEven = (e: number) => e % 2 === 0;
    const length = 7;
    const xs = LL.$range(0, length);
    const result = [0, 1, 2, 3, 4, 5, 6].filter(isEven);
    expect(LL.unsafeToArray(LL.$filter(isEven, xs))).toEqual(result);
  });
  it("should return an empty list if all the elements violates the predicate", () => {
    const isSpace = (e: string) => e === " ";
    const xs = LL.$filter(isSpace, LL.fromArray<string>("Hello!".split("")));
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
  it("should work with an infinite list", () => {
    const isOdd = (e: number) => e % 2 === 1;
    const length = 5;
    const xs = LL.$take(length, LL.$filter(isOdd, LL.$range(0)));
    const result = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(isOdd);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should evaluate the given predicate lazily", () => {
    const generateErr = <T>(_: T) => {
      void _;
      throw new Error("ERROR!");
    };
    const test = () => {
      return LL.$filter(generateErr, LL.$range(0, 10));
    };
    expect(test).not.toThrow();
  });
});

describe("$map:", () => {
  it("should properly map elements by the given function", () => {
    const square = (e: number) => e * e;
    const length = 7;
    const xs = LL.$map(square, LL.$range(0, length));
    const result = range(0, length).map(square);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should return an empty list if the given list is empty", () => {
    const f = <T>(_: T) => (void _, undefined);
    const xs = LL.$map(f, LL.fromArray([]));
    expect(LL.unsafeToArray(xs)).toEqual([]);
  });
  it("should work with an infinite list", () => {
    const f = <T>(_: T) => (void _, "HACKED");
    const length = 10;
    const xs = LL.$take(length, LL.$map(f, LL.$range(0)));
    const result = range(0, length).map(f);
    expect(LL.unsafeToArray(xs)).toEqual(result);
  });
  it("should evaluate the given function lazily", () => {
    const generateErr = <T>(_: T) => {
      void _;
      throw new Error("ERROR!");
    };
    const test = () => {
      return LL.$map(generateErr, LL.$range(0, 10));
    };
    expect(test).not.toThrow();
  });
});

describe("$fold:", () => {
  it("should properly fold elements by the given function", () => {
    const f = (acc: number, x: number) => x + acc;
    const length = 10;
    const xs = LL.$range(0, length);
    const result = range(0, length).reduce(f, 0);
    expect(LL.$fold(f, 0, xs)).toEqual(result);
  });
  it("should return the given initial value if the given list is empty", () => {
    const f = (acc: string, x: string) => `${acc} with ${x}`;
    const xs = LL.fromArray([]);
    const result = "Hello, World!";
    expect(LL.$fold(f, result, xs)).toEqual(result);
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const f = (acc: number, x: number) => x + acc;
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.$range(0, length);
      return LL.$fold(f, 0, xs);
    };
    expect(test).not.toThrow(RangeError);
  });
});

describe("$head:", () => {
  it("should properly take 1 element and force evaluation", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const result = range(0, length)[0];
    expect(LL.$head(xs)).toEqual(result);
  });
  it("should panic when an empty list is given", () => {
    const test = () => {
      const xs = LL.fromArray([]);
      return LL.$head(xs);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("empty list");
  });
});

describe("$last:", () => {
  it("should properly return a last element and force evaluation", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const result = range(0, length)[length - 1];
    expect(LL.$last(xs)).toEqual(result);
  });
  it("should throw LinkedListError when an empty list is given", () => {
    const test = () => {
      const xs = LL.fromArray([]);
      return LL.$last(xs);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("empty list");
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.$range(0, length);
      return LL.$last(xs);
    };
    expect(test).not.toThrow(RangeError);
  });
});

describe("tail:", () => {
  it("should properly return a list without the first element", () => {
    const length = 10;
    const xs = LL.tail(LL.$range(0, length));
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
});

describe("init:", () => {
  it("should properly return a list without the last element", () => {
    const length = 10;
    const xs = LL.init(LL.$range(0, length));
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
      const xs = LL.$range(0, length);
      return LL.init(xs);
    };
    expect(test).not.toThrow(RangeError);
  });
});

describe("$at:", () => {
  it("should properly return an element at the given index", () => {
    const length = 10;
    const idx = 5;
    const xs = LL.$range(0, length);
    const result = range(0, length)[idx];
    expect(LL.$at(xs, idx)).toEqual(result);
  });
  it("should throw LinkedListError when a negative index is given", () => {
    const test = () => {
      const length = 10;
      const idx = -1;
      const xs = LL.$range(0, length);
      return LL.$at(xs, idx);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("negative index");
  });
  it("should throw LinkedListError when the given index >= length of the list", () => {
    const test = () => {
      const idx = 0;
      const xs = LL.fromArray([]);
      return LL.$at(xs, idx);
    };
    expect(test).toThrow(LL.LinkedListError);
    expect(test).toThrow("index too large");
  });
  it("should not meet stack overflow", () => {
    const test = () => {
      const length = STACK_OVERFLOW_BOUND;
      const xs = LL.$range(0, length);
      return LL.$at(xs, length - 1);
    };
    expect(test).not.toThrow(RangeError);
  });
});

describe("$prepended:", () => {
  it("should properly prepend the given value", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const ys = LL.$prepended(-1, xs);
    const result = range(0, length);
    result.unshift(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should properly work with an empty list", () => {
    const xs = LL.fromArray([]);
    const ys = LL.$prepended(-1, xs);
    const result: number[] = [];
    result.unshift(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with multiple prepends", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const ys = LL.$prepended(-3, LL.$prepended(-2, LL.$prepended(-1, xs)));
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.unshift(e));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with different list operations", () => {
    const isOdd = (e: number) => e % 2 === 1;
    const length = 20;
    const xs = LL.$prepended(1, LL.$prepended(2, LL.$range(3, length)));
    const result = range(3, length);
    result.unshift(2);
    result.unshift(1);
    expect(LL.unsafeToArray(LL.$filter(isOdd, xs))).toEqual(result.filter(isOdd));
  });
  it("should work properly with an infinite list", () => {
    const xs = LL.$range(0);
    const [i, j] = [-1, -2];
    const ys = LL.$prepended(j, LL.$prepended(i, xs));
    const y1 = LL.$head(ys);
    const y2 = LL.$at(ys, 1);
    expect(y1).toEqual(j);
    expect(y2).toEqual(i);
  });
  it("should not touch the original list", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const ys = LL.$prepended(-3, LL.$prepended(-2, LL.$prepended(-1, xs)));
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.unshift(e));
    expect(LL.unsafeToArray(xs)).toEqual(range(0, length));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
});

describe("$pushed:", () => {
  it("should properly push the given value", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const ys = LL.$pushed(-1, xs);
    const result = range(0, length);
    result.push(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should properly work with an empty list", () => {
    const xs = LL.fromArray([]);
    const ys = LL.$pushed(-1, xs);
    const result: number[] = [];
    result.unshift(-1);
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with multiple pushes", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const ys = LL.$pushed(-3, LL.$pushed(-2, LL.$pushed(-1, xs)));
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.push(e));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
  it("should work properly with different list operations", () => {
    const isOdd = (e: number) => e % 2 === 1;
    const length = 20;
    const xs = LL.$pushed(21, LL.$pushed(20, LL.$range(3, length)));
    const result = range(3, length);
    result.push(20);
    result.push(21);
    expect(LL.unsafeToArray(LL.$filter(isOdd, xs))).toEqual(result.filter(isOdd));
  });
  it("should not touch the original list", () => {
    const length = 10;
    const xs = LL.$range(0, length);
    const ys = LL.$pushed(-3, LL.$pushed(-2, LL.$pushed(-1, xs)));
    const result = range(0, length);
    [-1, -2, -3].forEach((e) => result.push(e));
    expect(LL.unsafeToArray(xs)).toEqual(range(0, length));
    expect(LL.unsafeToArray(ys)).toEqual(result);
  });
});
