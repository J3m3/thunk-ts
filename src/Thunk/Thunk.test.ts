import { describe, expect, it } from "@jest/globals";
import { Expect, Equal } from "../../test/helper";
import { UnwrapThunk, toThunk } from ".";

describe("general type level conversion:", () => {
  it("should let TypeScript compiler to infer type correctly", () => {
    const x: string = "Hello, World!";
    const xT = () => x;
    ({}) as Expect<Equal<UnwrapThunk<typeof xT>, typeof x>>;
    expect(1).toBe(1);
  });
});

describe("toThunk:", () => {
  it("should properly wrap values into function", () => {
    const s = "Hello, World!";
    const n = 11;
    const sT = toThunk(s);
    const nT = toThunk(n);
    expect(sT()).toEqual(s);
    expect(nT()).toEqual(n);
  });
  it("should not deep-copy the given argument", () => {
    const obj = {
      a: {
        b: "Hello, World!",
      },
      c: [0, 1, 2],
      d: 5,
    };
    const objT = toThunk(obj);
    obj.a.b = "Hell";
    obj.c[0] = 100;
    obj.d = 100;
    expect(objT()).toEqual(obj);
  });
});
