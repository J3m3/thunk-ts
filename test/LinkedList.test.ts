import { describe, expect, it } from "@jest/globals";
import { toThunk } from "../src/Thunk";
import * as LL from "../src/LinkedList";

expect.addEqualityTesters([]);

it("should maintain consistency when converting from array to linked list and back", () => {
  expect(LL.unsafeToArray(LL.fromArray([1, 2, 3]))).toEqual([1, 2, 3]);
});

describe("fromArray:", () => {
  it("should generate Thunk<null> when an empty array is given", () => {
    expect(LL.fromArray([])()).toEqual(null);
  });
});

describe("range:", () => {
  it("should generate a properly bounded `[)` lazy list", () => {
    expect(LL.unsafeToArray(LL.range(toThunk(3), toThunk(7)))).toEqual([3, 4, 5, 6]);
  });
});
describe("$range:", () => {
  it("should generate a properly bounded `[)` lazy list", () => {
    expect(LL.unsafeToArray(LL.$range(3, 7))).toEqual([3, 4, 5, 6]);
  });
});

describe("take", () => {
  it("should take exact amount of the given n", () => {
    const xs = LL.fromArray("Hello, World!".split(""));
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
    const xs = LL.fromArray([0, 1, 2, 3]);
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
describe("$take", () => {
  it("should take exact amount of the given n", () => {
    const xs = LL.fromArray("Hello, World!".split(""));
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
    const xs = LL.fromArray([0, 1, 2, 3]);
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
