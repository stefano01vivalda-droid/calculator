import { Easing } from "remotion";
import type { ReactNode } from "react";

import { step, type SpringConfig } from "../../kit/spring";
import { clamp01 } from "../../kit/time";
import { BEAT, CUE, PULSES } from "./cues";
import { COVER, HERO, PRICE, TAG } from "./layout";
import { FONT, H, PINK_RGB, W } from "./tokens";

/**
 * The liquid: every pink shape in one SVG group under a goo filter (blur the
 * alpha, then threshold it), so shapes that touch merge and crossfades melt.
 * The filter dilates the result for a black outline, like the coins on
 * gumroad.com. Colors come from the filter, so shapes only need alpha.
 */
export function LiquidFilter({ id, blur = 14, outline = 5, depth = 0, x = 0, y = 0, width = W, height = H }: { id: string; blur?: number; outline?: number; depth?: number; x?: number; y?: number; width?: number; height?: number }) {
  const [r, g, b] = PINK_RGB;
  // Thickness like the pink coins on gumroad.com: stacked copies down and to the right form a solid edge.
  const steps = depth > 0.5 ? [1, 2, 3, 4, 5].map((i) => (depth * i) / 5) : [];
  return (
    <filter id={id} filterUnits="userSpaceOnUse" x={x} y={y} width={width} height={height} colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="blur" />
      <feColorMatrix in="blur" type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 36 -17`} result="goo" />
      {outline > 0.05 ? (
        <>
          <feMorphology in="goo" operator="dilate" radius={outline} result="fat" />
          <feColorMatrix in="fat" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="ink" />
          {steps.map((d, i) => (
            <feOffset key={`i${i}`} in="ink" dx={d * 0.5} dy={d} result={`ink${i}`} />
          ))}
          {steps.map((d, i) => (
            <feOffset key={`g${i}`} in="goo" dx={d * 0.5} dy={d} result={`goo${i}`} />
          ))}
          <feMerge>
            {steps.map((_, i) => (
              <feMergeNode key={`mi${i}`} in={`ink${i}`} />
            ))}
            {steps.map((_, i) => (
              <feMergeNode key={`mg${i}`} in={`goo${i}`} />
            ))}
            <feMergeNode in="ink" />
            <feMergeNode in="goo" />
          </feMerge>
        </>
      ) : null}
    </filter>
  );
}

/** Digit height as a share of the font size (Instrument Sans lining figures). */
const FIGURE = 0.7;
const melt = Easing.inOut(Easing.cubic);
const pop: SpringConfig = { stiffness: 240, damping: 14 };
const glide: SpringConfig = { stiffness: 150, damping: 20 };

/** A decaying squash, started at `start`: positive stretches x and squashes y. */
export const wobble = (t: number, start: number, amp: number, freq = 18, decay = 6) =>
  t < start ? 0 : amp * Math.exp(-decay * (t - start)) * Math.cos(freq * (t - start));

/** A quick bump on each listed beat: peaks 60 ms after the beat, then settles. */
const pulse = (t: number, beats: readonly number[], amp = 0.06) =>
  beats.reduce((sum, beat) => {
    const u = (t - beat) / 0.06;
    return u < 0 ? sum : sum + amp * u * Math.exp(1 - u);
  }, 0);

const fade = (t: number, start: number, length: number) => melt(clamp01((t - start) / length));

function Blob({ x, y, r, sx = 1, sy = 1, opacity = 1 }: { x: number; y: number; r: number; sx?: number; sy?: number; opacity?: number }) {
  if (r <= 0.5 || opacity <= 0) return null;
  return <ellipse cx={x} cy={y} rx={r * sx} ry={r * sy} opacity={opacity} />;
}

function Glyph({ text, size, x, y, sx = 1, sy = 1, opacity = 1 }: { text: string; size: number; x: number; y: number; sx?: number; sy?: number; opacity?: number }) {
  if (opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`} opacity={opacity}>
      <text x={0} y={(size * FIGURE) / 2} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={size}>
        {text}
      </text>
    </g>
  );
}

/** Gumroad's price tag: a flag with a notched tail, centered on 0,0. */
export const tagPath = (w: number, h: number) => `M${-w / 2},${-h / 2} H${w / 2} L${w / 2 - 24},0 L${w / 2},${h / 2} H${-w / 2} Z`;

function Tag({ x, y, s, opacity }: { x: number; y: number; s: number; opacity: number }) {
  if (opacity <= 0) return null;
  return <path d={tagPath(TAG.w, TAG.h)} transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} />;
}

/**
 * Droplets thrown up from a point that fall back into it and merge (the goo
 * filter joins them), so none dries up into a speck of outline.
 */
function splash(t: number, start: number, x: number, y: number, { count = 7, life = 0.6, reach = 120, size = 1 } = {}) {
  const gravity = 8000;
  return Array.from({ length: count }, (_, i) => {
    const own = life * (0.78 + 0.11 * (i % 3));
    const tau = t - start;
    if (tau < 0 || tau > own) return null;
    const side = i - (count - 1) / 2;
    const vy = (-gravity * own) / 2;
    const r = (22 + (i % 3) * 7) * size * Math.min(1, (own - tau) / 0.12 + 0.35);
    return <Blob key={`s${start}-${i}`} x={x + (side * reach * tau) / own} y={y + vy * tau + (gravity * tau * tau) / 2} r={r} />;
  });
}

/** Everything liquid above the card: the drop, the "0", the gumball tag, the "$1" and the flood. */
export function HeroLiquid({ t }: { t: number }) {
  const shapes: ReactNode[] = [];
  let outline = 5;
  let depth = 14;
  let opacity = 1;
  const floor = COVER.y + COVER.h - 30; // where the melted 0 pours in (card at rest)

  if (t < CUE.fileIn + 0.3) {
    // Bar 1: a drop falls, splashes, and pulls itself into a "0".
    if (t < CUE.dropLand) {
      const u = t / CUE.dropLand;
      const y = 140 + (HERO.y - 140) * u * u;
      shapes.push(<Blob key="drop" x={HERO.x} y={y} r={62} sx={1 - 0.15 * u} sy={1 + 0.4 * u} />);
      shapes.push(<Blob key="tail1" x={HERO.x} y={y - 100 * u} r={34} />);
      shapes.push(<Blob key="tail2" x={HERO.x} y={y - 175 * u} r={18 * u} />);
    } else {
      const grow = step(t - CUE.dropLand, { stiffness: 220, damping: 16 });
      const squash = wobble(t, CUE.dropLand, 0.55, 20, 7);
      const toZero = fade(t, CUE.zero, 0.3);
      shapes.push(<Blob key="blob" x={HERO.x} y={HERO.y + 40 * (1 - grow)} r={(62 + 110 * grow) * (1 - 0.3 * toZero)} sx={1 + squash} sy={1 - 0.8 * squash} opacity={1 - toZero} />);
      shapes.push(...splash(t, CUE.dropLand, HERO.x, HERO.y - 60, { count: 5, life: 0.46, reach: 55, size: 1.1 }));

      const formed = step(t - CUE.zero, pop);
      const shake = wobble(t, CUE.zero + 0.2, 0.08, 16, 6);
      const bump = pulse(t, PULSES);
      const sink = fade(t, CUE.upload, 0.3);
      shapes.push(
        <Glyph key="zero" text="0" size={700} x={HERO.x} y={HERO.y + 90 * sink} sx={(0.7 + 0.3 * formed + shake + bump) * (1 - 0.2 * sink)} sy={(0.7 + 0.3 * formed - shake + bump) * (1 - 0.45 * sink)} opacity={toZero * (1 - sink)} />,
      );

      // Bar 2: the 0 melts into a blob that pours into the cover's floor.
      const pour = Easing.in(Easing.quad)(clamp01((t - CUE.upload - 0.08) / (CUE.fileIn - CUE.upload - 0.08)));
      const drain = clamp01((t - CUE.fileIn) / 0.25);
      shapes.push(<Blob key="melt" x={HERO.x} y={HERO.y + 60 + (floor - HERO.y - 60) * pour} r={(150 - 70 * pour) * (1 - drain)} sx={1 + 0.12 * pour} sy={1 - 0.1 * pour} opacity={sink} />);
    }
  }

  if (t >= CUE.price && t < CUE.tagSolid + 0.14) {
    // Bar 3: a gumball swells in the price cell and pulls into the tag.
    outline = 4;
    depth = 0;
    const grow = step(t - CUE.price, pop);
    const squash = wobble(t, CUE.price, 0.3, 22, 7);
    const toTag = fade(t, CUE.price + BEAT / 2, 0.24);
    shapes.push(<Blob key="gum" x={PRICE.x} y={PRICE.y} r={46 * grow} sx={1 + squash} sy={1 - squash} opacity={1 - toTag} />);
    shapes.push(<Tag key="tag" x={PRICE.x} y={PRICE.y} s={0.8 + 0.2 * toTag} opacity={toTag} />);
    opacity = 1 - clamp01((t - CUE.tagSolid) / 0.12);
  }

  if (t >= CUE.sale && t < CUE.flood + 0.56) {
    // Bar 5: the sold tag flies out and grows into the big "$1".
    outline = 5 * clamp01((t - CUE.sale) / 0.2);
    depth = 14 * clamp01((t - CUE.sale - 0.1) / 0.25);
    const u = step(t - CUE.sale, glide);
    const x = PRICE.x + (HERO.x - PRICE.x) * u;
    const y = PRICE.y + (HERO.y - PRICE.y) * u;
    const toDollar = fade(t, CUE.dollarMorph, 0.3);
    shapes.push(<Tag key="flying" x={x} y={y} s={(1 + 1.7 * u) * (1 - 0.3 * toDollar)} opacity={1 - toDollar} />);
    

    const formed = step(t - CUE.dollarMorph, pop);
    const shake = wobble(t, CUE.dollarMorph + 0.25, 0.08, 16, 6);
    const bump = pulse(t, PULSES);
    const toFlood = fade(t, CUE.flood, 0.14);
    shapes.push(<Glyph key="dollar" text="$1" size={580} x={HERO.x} y={HERO.y} sx={0.75 + 0.25 * formed + shake + bump} sy={0.75 + 0.25 * formed - shake + bump} opacity={toDollar * (1 - toFlood)} />);

    // Bar 6: the "$1" bursts into a flood that fills the frame.
    if (t >= CUE.flood) {
      outline = 6;
      const reach = Easing.in(Easing.cubic)(clamp01((t - CUE.flood) / 0.5));
      const radius = 300 + 1150 * reach;
      shapes.push(<Blob key="flood" x={HERO.x} y={HERO.y} r={radius} opacity={toFlood} />);
      for (let i = 0; i < 11; i++) {
        const angle = (i / 11) * Math.PI * 2 + 0.3 * Math.sin(i * 2.1);
        const distance = radius * (1 + 0.07 * Math.sin(i * 1.7 + t * 9));
        shapes.push(<Blob key={`lobe${i}`} x={HERO.x + Math.cos(angle) * distance} y={HERO.y + Math.sin(angle) * distance} r={(0.1 + 0.03 * (i % 3)) * radius} opacity={toFlood} />);
      }
    }
  }

  if (shapes.length === 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <LiquidFilter id="liquid" outline={outline} depth={depth} />
      </defs>
      <g filter="url(#liquid)" opacity={opacity}>
        {shapes}
      </g>
    </svg>
  );
}
