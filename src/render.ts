import { traitsFor, type Traits } from "./aging.js";

export interface RenderOptions {
  /** Rendered width in pixels. Height follows the 200:220 viewBox. Defaults to 200. */
  size?: number;
  /** Accessible label for the image. */
  title?: string;
}

const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 220;
const CENTER_X = 100;
const GROUND_Y = 200;
const INK = "#1d2a1f";

// Blades are added in this order so existing ones never move as the tuft fills in.
const TUFT_ANGLES = [0, -22, 22, -44, 44, -11, 11, -33, 33];

const n = (value: number) => String(Math.round(value * 100) / 100);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hsl = (h: number, s: number, l: number) => `hsl(${n(h)} ${n(s)}% ${n(l)}%)`;

function body(t: Traits, fill: string): string {
  const left = CENTER_X - t.width / 2;
  const right = CENTER_X + t.width / 2;
  const top = GROUND_Y - t.height;
  const mid = GROUND_Y - t.height * 0.4;
  // Control points placed so the curve peaks exactly at `top` and bottoms out at the ground.
  const upper = (top - 0.25 * mid) / 0.75;
  const lower = (GROUND_Y - 0.25 * mid) / 0.75;
  const d =
    `M${n(left)} ${n(mid)}` +
    `C${n(left)} ${n(upper)} ${n(right)} ${n(upper)} ${n(right)} ${n(mid)}` +
    `C${n(right)} ${n(lower)} ${n(left)} ${n(lower)} ${n(left)} ${n(mid)}Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

function tuft(t: Traits): string {
  const count = Math.min(Math.ceil(t.tuft), TUFT_ANGLES.length);
  const baseY = GROUND_Y - t.height + 5;
  const fill = hsl(
    lerp(t.hue + 10, 70, t.tuftGrey),
    lerp(t.saturation + 10, 6, t.tuftGrey),
    lerp(t.lightness - 12, 78, t.tuftGrey),
  );
  let blades = "";
  for (let i = 0; i < count; i++) {
    const growth = i === count - 1 ? t.tuft - (count - 1) : 1;
    const length = t.tuftLength * growth;
    const half = Math.max(2, length * 0.2);
    const d =
      `M${CENTER_X} ${n(baseY)}` +
      `Q${n(CENTER_X - half)} ${n(baseY - length * 0.6)} ${CENTER_X} ${n(baseY - length)}` +
      `Q${n(CENTER_X + half)} ${n(baseY - length * 0.6)} ${CENTER_X} ${n(baseY)}Z`;
    blades += `<path d="${d}" transform="rotate(${TUFT_ANGLES[i]} ${CENTER_X} ${n(baseY)})"/>`;
  }
  return `<g fill="${fill}">${blades}</g>`;
}

function lichen(t: Traits): string {
  if (t.lichen <= 0) return "";
  const spots: [x: number, y: number, r: number][] = [
    [-0.3, 0.26, 6],
    [0.3, 0.36, 5],
    [0.17, 0.13, 4],
    [-0.12, 0.84, 4.5],
  ];
  const circles = spots
    .map(([x, y, r]) => `<circle cx="${n(CENTER_X + x * t.width)}" cy="${n(GROUND_Y - y * t.height)}" r="${r}"/>`)
    .join("");
  return `<g fill="hsl(58 32% 80%)" opacity="${n(t.lichen * 0.8)}">${circles}</g>`;
}

function face(t: Traits): string {
  const eyeY = GROUND_Y - t.height * t.eyeHeight;
  const ry = t.eyeRadius * t.eyeOpen;
  const mouthY = eyeY + t.height * 0.13;
  let out = "";

  for (const side of [-1, 1]) {
    const x = CENTER_X + side * t.eyeSpacing;
    out += `<ellipse cx="${n(x)}" cy="${n(eyeY)}" rx="${n(t.eyeRadius)}" ry="${n(ry)}" fill="${INK}"/>`;
    out +=
      `<circle cx="${n(x - t.eyeRadius * 0.3)}" cy="${n(eyeY - ry * 0.3)}" r="${n(t.eyeRadius * 0.32)}"` +
      ` fill="#fff" opacity="${n(t.eyeShine)}"/>`;
    if (t.blush > 0) {
      out +=
        `<ellipse cx="${n(x + side * (t.eyeRadius + 7))}" cy="${n(eyeY + t.eyeRadius + 4)}" rx="7" ry="4.5"` +
        ` fill="#ff8fa3" opacity="${n(t.blush * 0.7)}"/>`;
    }
    if (t.brow > 0) {
      const browY = eyeY - ry - 5;
      const stroke = hsl(130, lerp(20, 4, t.tuftGrey), lerp(16, 74, t.tuftGrey));
      out +=
        `<line x1="${n(x - side * (t.eyeRadius + 3))}" y1="${n(browY)}"` +
        ` x2="${n(x + side * (t.eyeRadius + 3))}" y2="${n(browY + 2)}"` +
        ` stroke="${stroke}" stroke-width="${n(2 + t.brow * 1.5)}" opacity="${n(t.brow)}"/>`;
    }
    if (t.wrinkles > 0) {
      const bagY = eyeY + ry + 3;
      out +=
        `<path d="M${n(x - t.eyeRadius)} ${n(bagY)}Q${n(x)} ${n(bagY + 4)} ${n(x + t.eyeRadius)} ${n(bagY)}"` +
        ` stroke="${INK}" stroke-width="1.2" opacity="${n(t.wrinkles * 0.45)}"/>`;
    }
  }

  if (t.wrinkles > 0) {
    for (const [offset, half] of [[0.17, 13], [0.22, 9]] as const) {
      const y = eyeY - t.height * offset;
      out +=
        `<path d="M${n(CENTER_X - half)} ${n(y)}Q${CENTER_X} ${n(y - 3)} ${n(CENTER_X + half)} ${n(y)}"` +
        ` stroke="${INK}" stroke-width="1.2" opacity="${n(t.wrinkles * 0.4)}"/>`;
    }
  }

  const half = t.mouthWidth / 2;
  out +=
    `<path d="M${n(CENTER_X - half)} ${n(mouthY)}Q${CENTER_X} ${n(mouthY + t.smile * 2)} ${n(CENTER_X + half)} ${n(mouthY)}"` +
    ` stroke="${INK}" stroke-width="2.5"/>`;

  return `<g fill="none" stroke-linecap="round">${out}</g>`;
}

/** Render the mascot as an SVG string, from an age in years or from explicit traits. */
export function renderSvg(ageOrTraits: number | Traits, options: RenderOptions = {}): string {
  const t = typeof ageOrTraits === "number" ? traitsFor(ageOrTraits) : ageOrTraits;
  const size = options.size ?? VIEW_WIDTH;
  const title = options.title ?? "Moss";
  const fill = hsl(t.hue, t.saturation, t.lightness);
  const feet = hsl(t.hue, t.saturation, t.lightness - 12);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}"` +
    ` width="${n(size)}" height="${n((size * VIEW_HEIGHT) / VIEW_WIDTH)}" role="img" aria-label="${title}">` +
    `<ellipse cx="${CENTER_X}" cy="${GROUND_Y + 4}" rx="${n(t.width * 0.48)}" ry="7" fill="#000" opacity="0.14"/>` +
    `<g transform="rotate(${n(t.stoop)} ${CENTER_X} ${GROUND_Y})">` +
    tuft(t) +
    `<ellipse cx="${n(CENTER_X - t.width * 0.22)}" cy="${GROUND_Y}" rx="13" ry="6" fill="${feet}"/>` +
    `<ellipse cx="${n(CENTER_X + t.width * 0.22)}" cy="${GROUND_Y}" rx="13" ry="6" fill="${feet}"/>` +
    body(t, fill) +
    lichen(t) +
    face(t) +
    `</g></svg>`
  );
}
