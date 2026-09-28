import { Easing } from "remotion";

import { step } from "../../kit/spring";
import { clamp01 } from "../../kit/time";
import { CUE } from "./cues";
import { CARD, COVER, INFO, ROW, TAG } from "./layout";
import { LiquidFilter, tagPath, wobble } from "./liquid";
import { C } from "./tokens";

/**
 * Twin of the product card on gumroad.com ("How to Play Ukelele" by Priyanka,
 * spelled right here): white surface, black lines, a hard black shadow, an
 * "Add to cart" cell and the pink price tag. Redrawn, not imported: the film
 * lives outside Gumroad's codebase. Demo data comes from their landing page.
 */
export function ProductCard({ t }: { t: number }) {
  const leave = Easing.in(Easing.quad)(clamp01((t - CUE.sale - 0.04) / 0.26));
  if (t < CUE.upload || leave >= 1) return null;
  const enter = step(t - CUE.upload, { stiffness: 140, damping: 18 });
  const pressed = t >= CUE.click && t < CUE.sale;

  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        translate: `0 ${(1 - enter) * 320 + leave * 60}px`,
        opacity: clamp01((t - CUE.upload) / 0.12) * (1 - leave),
        filter: leave > 0 ? `blur(${leave * 12}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", inset: 0, translate: `${CARD.shadow}px ${CARD.shadow}px`, background: C.black, borderRadius: CARD.radius }} />
      <div style={{ position: "absolute", inset: 0, background: C.white, border: `${CARD.line}px solid ${C.black}`, borderRadius: CARD.radius, overflow: "hidden" }}>
        <Cover t={t} />
        <div style={{ position: "absolute", left: 0, right: 0, top: COVER.h, height: CARD.line, background: C.black }} />
        <div style={{ position: "absolute", left: 40, top: INFO.top + 30, fontSize: 50, lineHeight: 1.1, color: C.black }}>How to Play Ukulele</div>
        <div style={{ position: "absolute", left: 40, top: INFO.top + 108, display: "flex", alignItems: "center", gap: 16, fontSize: 36, color: C.black }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: C.teal, border: `3px solid ${C.black}` }} />
          Priyanka
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: ROW.top - CARD.line, height: CARD.line, background: C.black }} />
        <div
          data-target="cart"
          style={{
            position: "absolute",
            left: 0,
            top: ROW.top,
            width: ROW.split,
            height: ROW.h,
            display: "grid",
            placeItems: "center",
            fontSize: 40,
            background: pressed ? C.black : C.white,
            color: pressed ? C.white : C.black,
          }}
        >
          <span style={{ scale: String(1 - 0.05 * Math.sin(Math.PI * clamp01((t - CUE.click) / 0.16))) }}>Add to cart</span>
        </div>
        <div style={{ position: "absolute", left: ROW.split, top: ROW.top, width: CARD.line, height: ROW.h, background: C.black }} />
        <PriceTag t={t} />
      </div>
    </div>
  );
}

/** The cover: an empty drop zone, then pink rising in it like a glass filling, then the video's play pill. */
function Cover({ t }: { t: number }) {
  const rise = Easing.inOut(Easing.quad)(clamp01((t - CUE.fileIn) / (CUE.filled - CUE.fileIn)));
  const level = 470 - rise * 560;
  const amp = 20 * (1 - 0.6 * rise);
  let surface = `M-40,${COVER.h + 80}`;
  for (let x = -40; x <= COVER.w + 40; x += 24) {
    surface += ` L${x},${(level + amp * Math.sin(x / 95 + t * 7) + 0.5 * amp * Math.sin(x / 43 - t * 11)).toFixed(1)}`;
  }
  surface += ` L${COVER.w + 40},${COVER.h + 80} Z`;
  const bubble = 54 * (1 - clamp01((t - CUE.fileIn) / 0.4));
  const pill = step(t - CUE.filled, { stiffness: 300, damping: 15 });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: COVER.w, height: COVER.h, background: C.bg, overflow: "hidden" }}>
      <svg width={COVER.w} height={COVER.h} style={{ position: "absolute", inset: 0 }}>
        <rect x={32} y={32} width={COVER.w - 64} height={COVER.h - 64} rx={16} fill="none" stroke={C.black} strokeWidth={4} strokeDasharray="18 12" />
        <path d="M0,34 V-38 M-32,-6 L0,-38 L32,-6 M-58,22 V56 H58 V22" transform={`translate(${COVER.w / 2} ${COVER.h / 2 - 6})`} fill="none" stroke={C.black} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        {t >= CUE.fileIn ? (
          <>
            <defs>
              <LiquidFilter id="cover-liquid" outline={4} x={-80} y={-80} width={COVER.w + 160} height={COVER.h + 200} />
            </defs>
            <g filter="url(#cover-liquid)">
              <path d={surface} />
              {bubble > 0.5 ? <circle cx={COVER.w / 2} cy={level - 6} r={bubble} /> : null}
            </g>
          </>
        ) : null}
      </svg>
      {pill > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: COVER.w / 2 - 105,
            top: COVER.h / 2 - 58,
            width: 210,
            height: 116,
            borderRadius: 58,
            background: C.white,
            border: `4px solid ${C.black}`,
            scale: String(pill),
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width={60} height={60} viewBox="-30 -30 60 60">
            <path d="M-12,-19 L20,0 L-12,19 Z" fill={C.pink} stroke={C.black} strokeWidth={5} strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

/** The crisp tag once the gumball has set: $0 rolls to $1, pulses, hops when it sells. */
function PriceTag({ t }: { t: number }) {
  if (t < CUE.tagSolid || t >= CUE.sale) return null;
  const roll = Easing.bezier(0.22, 1, 0.36, 1)(clamp01((t - CUE.priceOne) / 0.22));
  const bump = wobble(t, CUE.tagPulse, 0.08, 20, 8) + wobble(t, CUE.priceOne, 0.05, 20, 8);
  const hop = Math.sin(Math.PI * clamp01((t - CUE.hop) / 0.3)) * 18;
  const cellW = 792 - ROW.split - CARD.line;
  return (
    <div data-target="price" style={{ position: "absolute", left: ROW.split + CARD.line + (cellW - TAG.w) / 2, top: ROW.top + (ROW.h - TAG.h) / 2, width: TAG.w, height: TAG.h, translate: `0 ${-hop}px`, scale: `${1 + bump} ${1 - bump}` }}>
      <svg width={TAG.w} height={TAG.h} style={{ position: "absolute", inset: 0 }}>
        <path d={tagPath(TAG.w, TAG.h)} transform={`translate(${TAG.w / 2} ${TAG.h / 2})`} fill={C.pink} />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, width: TAG.w - 22, height: TAG.h, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, color: C.black, overflow: "hidden" }}>
        $
        <span style={{ position: "relative", display: "inline-block", width: "0.6em", height: TAG.h, overflow: "hidden" }}>
          <span style={{ position: "absolute", left: 0, top: 0, height: TAG.h, display: "flex", alignItems: "center", translate: `0 ${-roll * TAG.h}px` }}>0</span>
          <span style={{ position: "absolute", left: 0, top: 0, height: TAG.h, display: "flex", alignItems: "center", translate: `0 ${(1 - roll) * TAG.h}px` }}>1</span>
        </span>
      </div>
    </div>
  );
}
