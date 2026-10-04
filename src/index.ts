import { ageInYears, stageFor, traitsFor, type DateLike, type Stage, type Traits } from "./aging.js";
import { renderSvg, type RenderOptions } from "./render.js";

export { ageInYears, stageFor, traitsFor, STAGES } from "./aging.js";
export type { DateLike, Stage, Traits } from "./aging.js";
export { renderSvg } from "./render.js";
export type { RenderOptions } from "./render.js";

export interface MossOptions {
  /** When this mascot was first created. The host app stores this and passes it back in. */
  bornAt: DateLike;
}

export interface Moss {
  readonly bornAt: Date;
  age(now?: DateLike): number;
  stage(now?: DateLike): Stage;
  traits(now?: DateLike): Traits;
  svg(now?: DateLike, options?: RenderOptions): string;
  toJSON(): { bornAt: string };
}

/** A mascot bound to a birth date. Everything else is derived from the current time. */
export function createMoss(options: MossOptions): Moss {
  const bornAt = new Date(options.bornAt);
  if (Number.isNaN(bornAt.getTime())) throw new RangeError("Invalid bornAt date");

  const age = (now?: DateLike) => ageInYears(bornAt, now);
  return {
    bornAt,
    age,
    stage: (now) => stageFor(age(now)),
    traits: (now) => traitsFor(age(now)),
    svg: (now, renderOptions) => renderSvg(age(now), renderOptions),
    toJSON: () => ({ bornAt: bornAt.toISOString() }),
  };
}
