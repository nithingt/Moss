# Moss

An agent mascot that ages with the person using it.

Most agent mascots are cute and stay cute forever. Moss starts as a bright, round sprout and grows up over real calendar years: it gets taller, its colours deepen, its eyes narrow, and eventually it turns grey, lined and lichen-covered.

## Usage

```ts
import { createMoss } from "moss-mascot";

// Store bornAt once, the first time a person uses your app, and pass it back in every time.
const moss = createMoss({ bornAt: "2026-10-04" });

moss.age();          // years since bornAt
moss.stage().name;   // "Sprout", "Seedling", "Sapling", "Grown", "Weathered" or "Ancient"
element.innerHTML = moss.svg(undefined, { size: 160 });
```

The mascot is stateless. Everything is derived from `bornAt` and the current time, so the only thing a host app has to persist is one date.

Lower-level functions are exported too: `ageInYears`, `stageFor`, `traitsFor` and `renderSvg`. `renderSvg` accepts either an age in years or a `Traits` object, so you can adjust individual traits before rendering.

## Life stages

| Stage | Starts at |
|---|---|
| Sprout | 0 years |
| Seedling | 1 year |
| Sapling | 4 years |
| Grown | 10 years |
| Weathered | 22 years |
| Ancient | 40 years |

Stages are only labels. Appearance changes continuously between them.

## Development

```bash
npm install
npm run dev        # demo with an age slider
npm test
npm run build
```

## Licence

MIT
