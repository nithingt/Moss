const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

export type DateLike = Date | string | number;

/** Every visual property of the mascot. All values are continuous so aging is gradual. */
export interface Traits {
  /** Body width and height in viewBox units. */
  width: number;
  height: number;
  eyeRadius: number;
  /** Half the distance between the eyes. */
  eyeSpacing: number;
  /** Eye position as a fraction of body height, measured from the ground. */
  eyeHeight: number;
  /** 1 is wide open, lower values narrow the eye. */
  eyeOpen: number;
  /** Opacity of the highlight in the eye. */
  eyeShine: number;
  /** Depth of the mouth curve. */
  smile: number;
  mouthWidth: number;
  /** Opacity of the cheeks. */
  blush: number;
  hue: number;
  saturation: number;
  lightness: number;
  /** Number of blades in the tuft on top. Fractions grow the newest blade. */
  tuft: number;
  tuftLength: number;
  /** 0 is fresh green, 1 is fully grey. */
  tuftGrey: number;
  /** Opacity of the brows. */
  brow: number;
  /** Opacity of the lines under the eyes and across the forehead. */
  wrinkles: number;
  /** Opacity of the lichen patches. */
  lichen: number;
  /** Forward lean in degrees. */
  stoop: number;
}

export interface Stage {
  name: string;
  /** Age in years at which this stage begins. */
  from: number;
}

export const STAGES: readonly Stage[] = [
  { name: "Sprout", from: 0 },
  { name: "Seedling", from: 1 },
  { name: "Sapling", from: 4 },
  { name: "Grown", from: 10 },
  { name: "Weathered", from: 22 },
  { name: "Ancient", from: 40 },
];

interface Keyframe {
  age: number;
  traits: Traits;
}

// Traits are interpolated linearly between these ages and held past the last one.
const KEYFRAMES: readonly Keyframe[] = [
  {
    age: 0,
    traits: {
      width: 96, height: 92,
      eyeRadius: 11, eyeSpacing: 20, eyeHeight: 0.42, eyeOpen: 1, eyeShine: 1,
      smile: 7, mouthWidth: 12, blush: 0.7,
      hue: 105, saturation: 58, lightness: 64,
      tuft: 1, tuftLength: 20, tuftGrey: 0,
      brow: 0, wrinkles: 0, lichen: 0, stoop: 0,
    },
  },
  {
    age: 2,
    traits: {
      width: 100, height: 112,
      eyeRadius: 10, eyeSpacing: 21, eyeHeight: 0.5, eyeOpen: 1, eyeShine: 1,
      smile: 8, mouthWidth: 16, blush: 0.55,
      hue: 108, saturation: 56, lightness: 58,
      tuft: 3, tuftLength: 24, tuftGrey: 0,
      brow: 0, wrinkles: 0, lichen: 0, stoop: 0,
    },
  },
  {
    age: 6,
    traits: {
      width: 98, height: 138,
      eyeRadius: 8, eyeSpacing: 20, eyeHeight: 0.58, eyeOpen: 0.95, eyeShine: 0.8,
      smile: 6, mouthWidth: 18, blush: 0.25,
      hue: 112, saturation: 50, lightness: 50,
      tuft: 5, tuftLength: 30, tuftGrey: 0,
      brow: 0.3, wrinkles: 0, lichen: 0, stoop: 0,
    },
  },
  {
    age: 15,
    traits: {
      width: 108, height: 156,
      eyeRadius: 7, eyeSpacing: 21, eyeHeight: 0.62, eyeOpen: 0.85, eyeShine: 0.6,
      smile: 4, mouthWidth: 20, blush: 0.08,
      hue: 115, saturation: 42, lightness: 42,
      tuft: 7, tuftLength: 26, tuftGrey: 0,
      brow: 0.7, wrinkles: 0.1, lichen: 0.1, stoop: 0,
    },
  },
  {
    age: 30,
    traits: {
      width: 116, height: 152,
      eyeRadius: 6.5, eyeSpacing: 22, eyeHeight: 0.6, eyeOpen: 0.72, eyeShine: 0.45,
      smile: 2.5, mouthWidth: 22, blush: 0,
      hue: 100, saturation: 30, lightness: 40,
      tuft: 6, tuftLength: 22, tuftGrey: 0.45,
      brow: 0.9, wrinkles: 0.55, lichen: 0.5, stoop: 3,
    },
  },
  {
    age: 50,
    traits: {
      width: 118, height: 138,
      eyeRadius: 6, eyeSpacing: 22, eyeHeight: 0.56, eyeOpen: 0.6, eyeShine: 0.35,
      smile: 3.5, mouthWidth: 22, blush: 0,
      hue: 85, saturation: 16, lightness: 46,
      tuft: 4, tuftLength: 18, tuftGrey: 1,
      brow: 1, wrinkles: 1, lichen: 0.9, stoop: 7,
    },
  },
];

/** Years between `bornAt` and `now`. Never negative. */
export function ageInYears(bornAt: DateLike, now: DateLike = new Date()): number {
  const born = new Date(bornAt).getTime();
  const current = new Date(now).getTime();
  if (Number.isNaN(born) || Number.isNaN(current)) {
    throw new RangeError("Invalid date");
  }
  return Math.max(0, (current - born) / MS_PER_YEAR);
}

export function stageFor(age: number): Stage {
  let current = STAGES[0]!;
  for (const stage of STAGES) {
    if (age >= stage.from) current = stage;
  }
  return current;
}

export function traitsFor(age: number): Traits {
  const first = KEYFRAMES[0]!;
  const last = KEYFRAMES[KEYFRAMES.length - 1]!;
  if (age <= first.age) return { ...first.traits };
  if (age >= last.age) return { ...last.traits };

  const next = KEYFRAMES.findIndex((k) => k.age > age);
  const a = KEYFRAMES[next - 1]!;
  const b = KEYFRAMES[next]!;
  const t = (age - a.age) / (b.age - a.age);

  const traits = { ...a.traits };
  for (const key of Object.keys(traits) as (keyof Traits)[]) {
    traits[key] = a.traits[key] + (b.traits[key] - a.traits[key]) * t;
  }
  return traits;
}
