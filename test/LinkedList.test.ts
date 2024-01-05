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
  it("should generate a properly bounded lazy list", () => {
    expect(LL.unsafeToArray(LL.$range(3, 7))).toEqual([3, 4, 5, 6]);
  });
});
