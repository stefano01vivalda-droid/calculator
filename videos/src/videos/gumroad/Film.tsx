import { AbsoluteFill, Audio, staticFile } from "remotion";

import { cursorAt, UserCursor } from "../../kit/cursor";
import { TargetLog } from "../../kit/debug";
import { Punchlines } from "../../kit/punchlines";
import { clamp01, useTime } from "../../kit/time";
import { ProductCard } from "./card";
import { b, CUE } from "./cues";
import { EndCard } from "./end";
import "./font";
import { CART } from "./layout";
import { HeroLiquid } from "./liquid";
import { C, FONT } from "./tokens";
import { CARDS } from "./words";

export type FilmProps = { fps: number; debug: boolean };

/** A buyer's cursor: in from the corner on "Start", clicks Add to cart on beat 3. */
function Buyer({ t }: { t: number }) {
  if (t < CUE.sell || t > CUE.sale + 0.25) return null;
  const { x, y, squash } = cursorAt(
    t,
    [
      { t: CUE.sell, x: 1130, y: 1900 },
      { t: b(4, 2), x: 790, y: 1600 },
      { t: CUE.click, x: CART.x + 150, y: CART.y + 12, click: true },
    ],
    (px, py) => ({ x: px, y: py }),
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, scale: "2", transformOrigin: "0 0", opacity: 1 - clamp01((t - CUE.sale) / 0.2) }}>
      <UserCursor x={0} y={0} squash={squash} />
    </div>
  );
}

export function GumroadAd({ debug }: FilmProps) {
  const t = useTime();
  const flooded = t >= CUE.flood + 0.5;
  return (
    <AbsoluteFill style={{ background: flooded ? C.pink : C.bg, fontFamily: FONT, color: C.black }}>
      <ProductCard t={t} />
      <HeroLiquid t={t} />
      <Punchlines t={t} cards={CARDS} theme={{ font: FONT, color: C.black, accent: C.pink, weight: 400 }} />
      <EndCard t={t} />
      <Buyer t={t} />
      <Audio src={staticFile("audio/gumroad/music.wav")} />
      {debug ? <TargetLog /> : null}
    </AbsoluteFill>
  );
}
