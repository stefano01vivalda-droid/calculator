<context>
Gumroad lets anyone sell digital products online: upload a file, set a price, start selling.
This film is a 15 s paid-social ad (9:16, with sound). It must also read with the sound off.
Read `videos/BRAND.md` first. It holds the brief, the look, the brand element, the components and what we may claim. This prompt only adds the story.
</context>

<inputs>
Decided: 1080x1920, 60 fps, light, 8 bars at 128 BPM, 15.0 s. Music: original, composed by `scripts/compose.py` from the cues, in `public/audio/gumroad/music.wav`. Grid measured with `scripts/beats.py`: 127.97 BPM, spread 1.8 ms.
</inputs>

<direction>
Pink gum, alive. One substance carries the whole film, and it is the money.
Ingredients: the liquid as brand element · punchlines word by word · the product card · a buyer's cursor.
Only Gumroad's surfaces, colors and lines. Banned: gradients, glows, particles, invented UI, promised earnings.
</direction>

<cast>
- The liquid: pink, black outline, coin edge. Drop, "0", cover fill, price tag, "$1", flood.
- Cursor: the buyer's OS arrow.
- Demo world, from the landing page: "How to Play Ukulele" by Priyanka (their mock spells it "Ukelele"), priced $1.
</cast>

<structure>
128 BPM, 4/4, 8 bars. One beat is 0.469 s. Something happens on every beat.

Bar 1, opening. A pink drop falls from frame 0, splashes on beat 2 and pulls into a big liquid "0" on beat 3. Words: "Go from".
Bar 2, "Upload a file." The card rises around the "0"; the 0 melts into the cover's drop zone and fills it like a glass. The play pill pops on beat 4.
Bar 3, "Set a price." A gumball swells in the price cell and sets into the tag; $0 rolls to $1 on beat 3.
Bar 4, "Start selling." A buyer's cursor glides in and clicks Add to cart on beat 3; the tag hops on beat 4.
Bar 5, the sale, on the downbeat (cha-ching). The card leaves; the tag flies to center and becomes the big liquid "$1". Words: "Go from 0 to".
Bar 6, the "$1" floods the frame pink. "Share your work."
Bar 7, "Someone out there / needs it." On beat 4, the name lands.
Bar 8, "Start selling" and gumroad.com. The last chord rings out.
</structure>

<build>
1. Remotion in `videos/`. Kit in `src/kit/`, this film in `src/videos/gumroad/`. fps from props: 60 in Studio, 240 for the final render.
2. Every style is a pure function of the frame.
3. `cues.ts` is the beat sheet as data; `scripts/cues-json.ts` writes `beat-sheet.md` and the cue file the music reads.
4. Music and SFX: `scripts/compose.py`, then check the grid with `scripts/beats.py`.
5. Final: `scripts/render.ts` (240 fps, motion blur), then `scripts/verify.py --no-loop` (durations, decoded colors).
</build>

<gotchas>
Liquid never crosses the words (splash arcs stay under y 600). Droplets fall back and merge instead of shrinking, or their outline outlives them as specks. Keep a slot for every word before it lands. Judge the encoded file, and decode its pixels.
</gotchas>
