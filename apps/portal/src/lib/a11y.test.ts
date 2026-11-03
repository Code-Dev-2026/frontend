import { describe, expect, it } from "vitest";
import { assertTouchTarget, MIN_TOUCH_TARGET_PX } from "./a11y";

describe("RNF-04: objetivos táctiles", () => {
  it("acepta el mínimo de 48 px y tamaños mayores", () => {
    expect(MIN_TOUCH_TARGET_PX).toBe(48);
    expect(assertTouchTarget(48)).toBe(true);
    expect(assertTouchTarget(64)).toBe(true);
  });

  it("rechaza objetivos menores a 48 px", () => {
    expect(() => assertTouchTarget(47)).toThrow(/RNF-04/);
  });

  it("rechaza valores no finitos", () => {
    expect(() => assertTouchTarget(Number.NaN)).toThrow(/RNF-04/);
    expect(() => assertTouchTarget(Number.POSITIVE_INFINITY)).toThrow(/RNF-04/);
  });
});
