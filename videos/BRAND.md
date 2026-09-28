# Gumroad video kit

The look, rules, assets and code for Gumroad films made here. Each film prompt points here and only adds its story.
Sources: gumroad.com (home, /features, /pricing), scraped and screenshotted on 2026-09-28. This is an unofficial spec ad: no Gumroad design files or code were available, so every component below is redrawn from the public site.

## The brief (from the interview)
- Plays: paid social, with sound. Format: 9:16, 1080x1920. Length: 15 s.
- Music: original, composed in code (`scripts/compose.py`). No license to clear.
- Must show: "Upload, set a price, sell" (their core promise).
- Ingredients: liquid motion (the user's ask) · big punchlines, word by word · the product card as the one UI scene · a buyer's cursor.
- Ending: "Share your work. Someone out there needs it." then the name, the "Start selling" button and gumroad.com.

## Hard rules
- Casing: sentence case in headlines and buttons ("Go from 0 to $1", "Start selling"). (gumroad.com)
- Type: one grotesk, regular weight for headlines (their hero is 96 px regular). (gumroad.com)
- Corners: 4 px on buttons and inputs; about 12 to 20 px on cards. (gumroad.com computed styles, screenshot)
- Surfaces: page `#F4F4F0`; white header and card surfaces. (gumroad.com)
- Borders and shadows: black lines; product mocks carry a hard black offset shadow, no blur. (screenshot)
- Illustration: flat fills with black outlines; pink coins have a visible edge (thickness). No gradients, no glows. (screenshot)
- Claims: see "Claims".

## Frame (1080x1920, 60 fps, light)
- Full bleed, no device frame. Content stays inside y 300 to 1560 and x 90 to 990 (Reels and TikTok overlays).
- Words: Instrument Sans 400, 116 to 120 px, black, centered at y 470 (over the card) or y 900 (on the pink flood).
- Scenes: only the card's own UI text.

## Color
| Token | Value | Use |
|---|---|---|
| background | `#F4F4F0` | page |
| surface | `#FFFFFF` | card body |
| foreground | `#000000` | text, lines, primary button |
| accent | `#FF90E8` | the liquid, price tag, cover fill, final flood |
| teal | `#23A093` | avatar (from their illustrations) |

Also on the site, unused here: yellow `#FFC901`, lime `#F1F233`, orange `#FF7051`. All sampled from screenshot pixels.

## Type
- Instrument Sans (OFL), `public/fonts/InstrumentSans.woff2`, loaded before the first frame (`font.ts`). Stand-in for ABC Favorit, Gumroad's commercial face.
- Sizes: punchlines 116 to 120 px, card title 50 px, card UI 36 to 46 px, liquid figures 580 to 700 px at weight 600.

## Signature elements
| Element | Look | Source | In films |
|---|---|---|---|
| Price tag | pink flag with a notched tail, black text, no border | Discover card | `tagPath()`; liquid while it forms, crisp once set |
| Product card | white, 4 px black lines, cover / title + creator / "Add to cart" + price row, hard shadow | home page mock | `card.tsx` |
| Buttons | black with white text ("Start selling"), 4 to 8 px radius | header, hero | end card |
| Coins | pink, black outline, visible edge | home hero | the liquid's outline and depth (`LiquidFilter`) |

## Logo and brand element
- Logo: not used. `assets.gumroad.com` is blocked in this environment, so the name is typeset. To use the real logo, drop `logo.svg` into `public/` and swap it in `end.tsx`.
- Brand element: the pink liquid (Gumroad's "gum"), one continuous substance: drop, "0", cover fill, price tag, "$1", flood.
- Never: glossy gradients, glows, particles, drop shadows with blur.

## Cursors
- The buyer: the OS arrow at 2x. A click is a short squash; the "Add to cart" cell inverts to black.

## Components
| Need | Component | In films: import / twin / redraw, and why |
|---|---|---|
| Product card | Gumroad's Discover card | redraw (`card.tsx`): no access to their code |
| Price tag | Discover price flag | redraw (`tagPath`) |
| Play pill | home page mock's video pill | redraw |

## Motion
- The liquid: goo filter (blur 14, alpha threshold), 5 px dilated outline, 14 px coin edge. Morphs are crossfades inside the filter; springs are closed form (`kit/spring.ts`).
- Wobble on landings (a decaying squash), a small bump on key beats. The user asked for liquid, so bounce is allowed here, on the liquid only.

## Claims
- Gumroad does (films may show): sell digital products (files, courses, memberships); set any price, including pay what you want; no monthly fee; 10% + 50¢ per direct sale; Merchant of Record for sales tax worldwide.
- Films must not show: guaranteed income, specific earnings as a promise, physical goods.
- Approved lines used: "Go from 0 to $1" (home hero), "I upload a file, set a price, and I can start selling" (creator quote on /features), "Share your work. Someone out there needs it." (site footer).

## Workspace
- `videos/`, Remotion 4.0.529 pinned, React 19. No Tailwind, no webpack override.
- Scripts: `compose.py` (music + SFX from `cues.ts`), `cues-json.ts` (cues export and `beat-sheet.md`), `beats.py` (measure the grid), `stills.ts`, `sheet.py` (contact sheets), `render.ts`, `verify.py`.
