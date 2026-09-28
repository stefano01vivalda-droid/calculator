# Gumroad liquid ad (15 s, 9:16)

An unofficial spec ad for Gumroad, built in code with Remotion and the `product-film` skill. The pink "gum" liquid carries the whole story: "Go from 0 to $1", upload a file, set a price, start selling.

- `BRAND.md`: the look, rules, claims and sources. `gumroad-prompt.md`: the story. `beat-sheet.md`: every cue on the 128 BPM grid.
- `src/videos/gumroad/`: `cues.ts` (timeline), `liquid.tsx` (the goo filter and every liquid shape), `card.tsx` (product card twin), `words.ts`, `end.tsx`.

## Commands

```bash
npm install
npx remotion studio src/index.ts                                  # preview and scrub
bun scripts/cues-json.ts out/cues.json beat-sheet.md              # after editing cues.ts
uv run --with numpy --with scipy python3 scripts/compose.py out/cues.json public/audio/gumroad/music.wav
bun scripts/stills.ts out/review/vN 90 294 540 --composition GumroadAd
bun scripts/render.ts GumroadAd gumroad-ad --duration 15 --poster 8.9
uv run --with numpy --with imageio-ffmpeg python3 scripts/verify.py out/gumroad-ad --duration 15 --size 1080x1920 --bg 244,244,240 --no-loop
```

The music is composed from the cues, so re-run `cues-json.ts` and `compose.py` whenever timing changes.

## Before you post it

- It is unofficial: Gumroad's name and look are theirs. Label it as a concept or spec piece.
- The name on the end card is typeset in Instrument Sans (Gumroad's font, ABC Favorit, is commercial, and their logo file was not reachable). Swap in the real logo in `end.tsx` if you have it.
- Remotion is free for individuals and small teams; companies above that need a license (remotion.dev/license).
