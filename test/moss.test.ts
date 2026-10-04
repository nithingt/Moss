import { describe, expect, it } from "vitest";
import { ageInYears, createMoss, renderSvg, stageFor, traitsFor } from "../src/index";

describe("ageInYears", () => {
  it("measures calendar years", () => {
    expect(ageInYears("2020-01-01", "2030-01-01")).toBeCloseTo(10, 1);
  });

  it("is never negative", () => {
    expect(ageInYears("2030-01-01", "2020-01-01")).toBe(0);
  });

  it("rejects invalid dates", () => {
    expect(() => ageInYears("not a date")).toThrow(RangeError);
  });
});

describe("stageFor", () => {
  it("picks the stage by age", () => {
    expect(stageFor(0).name).toBe("Sprout");
    expect(stageFor(0.99).name).toBe("Sprout");
    expect(stageFor(1).name).toBe("Seedling");
    expect(stageFor(12).name).toBe("Grown");
    expect(stageFor(90).name).toBe("Ancient");
  });
});

describe("traitsFor", () => {
  it("interpolates between keyframes", () => {
    expect(traitsFor(1).height).toBeCloseTo(102);
    expect(traitsFor(1).tuft).toBeCloseTo(2);
  });

  it("holds the first and last keyframes outside the range", () => {
    expect(traitsFor(-5)).toEqual(traitsFor(0));
    expect(traitsFor(200)).toEqual(traitsFor(50));
  });

  it("loses its cuteness with age", () => {
    const young = traitsFor(0);
    const old = traitsFor(50);
    expect(old.eyeRadius).toBeLessThan(young.eyeRadius);
    expect(old.blush).toBe(0);
    expect(old.wrinkles).toBeGreaterThan(young.wrinkles);
    expect(old.saturation).toBeLessThan(young.saturation);
  });
});

describe("renderSvg", () => {
  it("returns a sized svg", () => {
    const svg = renderSvg(3, { size: 100 });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('width="100"');
    expect(svg).toContain('height="110"');
    expect(svg).not.toContain("NaN");
  });

  it("draws one blade per unit of tuft", () => {
    const blades = (age: number) => renderSvg(age).match(/rotate\(-?\d+ 100 /g)!.length - 1;
    expect(blades(0)).toBe(1);
    expect(blades(15)).toBe(7);
  });
});

describe("createMoss", () => {
  it("derives everything from bornAt", () => {
    const moss = createMoss({ bornAt: "2020-06-01T00:00:00Z" });
    expect(moss.stage("2026-06-01T00:00:00Z").name).toBe("Sapling");
    expect(moss.svg("2026-06-01T00:00:00Z")).toBe(renderSvg(moss.age("2026-06-01T00:00:00Z")));
    expect(createMoss(moss.toJSON()).bornAt).toEqual(moss.bornAt);
  });
});
