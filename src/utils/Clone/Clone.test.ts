import { describe, expect, it } from "@jest/globals";
import { deepCopy } from ".";

describe("deepCopy:", () => {
  it("should perform `deep-copy` when an nested array is given", () => {
    const xs = [
      [
        [1, 2],
        [3, 4],
      ],
      [[5], [6, 7, 8]],
    ];
    const ys = deepCopy(xs);
    xs[0][0][0] = 10000;
    const result = [
      [
        [1, 2],
        [3, 4],
      ],
      [[5], [6, 7, 8]],
    ];
    expect(ys).toEqual(result);
  });
  it("should perform `deep-copy` when a nested object is given", () => {
    const obj1 = {
      a: [
        [1, 2],
        [3, 4],
      ],
      b: {
        c: "hello",
        d: ["world!"],
      },
    };
    const obj2 = deepCopy(obj1);
    obj1.a[0][0] = 1000;
    obj1.b.c = "hell";
    const result = {
      a: [
        [1, 2],
        [3, 4],
      ],
      b: {
        c: "hello",
        d: ["world!"],
      },
    };
    expect(obj2).toEqual(result);
  });
  it("should return exact value when a primitive value is given", () => {
    const s = Symbol();
    const cases = [1, "hi", undefined, true, s];
    cases.forEach((v, idx) => {
      expect(deepCopy(v)).toEqual(cases[idx]);
    });
  });
  it("should return exact value when `null` is given", () => {
    const nullObj = null;
    expect(deepCopy(nullObj)).toEqual(null);
  });
});
