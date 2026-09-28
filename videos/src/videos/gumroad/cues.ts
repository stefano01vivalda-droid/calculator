import { at, type Grid } from "../../kit/time";

/**
 * The beat sheet as data. The music is composed for this grid
 * (scripts/compose.py), so bar 1 beat 1 is t = 0 and 8 bars are 15.0 s.
 * Scene code reads cues from here and never holds a literal time.
 */
export const GRID: Grid = { bpm: 128, firstBeat: 0, pickupBeats: 0, beatsPerBar: 4 };
export const BARS = 8;
export const b = (bar: number, beat = 1, fraction = 0) => at(GRID, bar, beat, fraction);
export const BEAT = 60 / GRID.bpm;
export const DURATION = b(BARS + 1);

export const CUE = {
  // Bar 1: a drop of pink lands and becomes the "0" of "Go from 0".
  dropLand: b(1, 2),
  zero: b(1, 3),
  // Bar 2: "Upload a file." The 0 melts into the card's cover and fills it.
  upload: b(2, 1),
  fileIn: b(2, 2),
  filled: b(2, 4),
  // Bar 3: "Set a price." A gumball becomes the price tag, $0 rolls to $1.
  price: b(3, 1),
  tagSolid: b(3, 2),
  priceOne: b(3, 3),
  tagPulse: b(3, 4),
  // Bar 4: "Start selling." A buyer clicks Add to cart.
  sell: b(4, 1),
  click: b(4, 3),
  hop: b(4, 4),
  // Bar 5: the sale. The tag flies out and becomes the big liquid "$1".
  sale: b(5, 1),
  dollarMorph: b(5, 2),
  // Bar 6: "$1" floods the frame pink. "Share your work."
  flood: b(6, 1),
  // Bars 7 and 8: "Someone out there needs it." Then the end card.
  wordmark: b(7, 4),
  button: b(8, 1),
  url: b(8, 2),
} as const;

/** Beats where the hero liquid gets a small kick. */
export const PULSES = [b(1, 4), b(2, 1), b(5, 3), b(5, 4)];

/** Sound effects, placed so each transient lands on its cue (compose.py reads this). */
export const SFX: { name: string; at: number; gain: number }[] = [
  { name: "bloopLow", at: CUE.dropLand, gain: 0.55 },
  { name: "bloopUp", at: CUE.zero, gain: 0.4 },
  { name: "bloopLow", at: CUE.fileIn, gain: 0.45 },
  { name: "glug", at: CUE.fileIn + BEAT / 2, gain: 0.3 },
  { name: "pop", at: CUE.filled, gain: 0.4 },
  { name: "bloopUp", at: CUE.price, gain: 0.35 },
  { name: "pop", at: CUE.tagSolid, gain: 0.35 },
  { name: "tick", at: CUE.priceOne, gain: 0.35 },
  { name: "click", at: CUE.click, gain: 0.5 },
  { name: "chaching", at: CUE.sale, gain: 0.5 },
  { name: "bloopLow", at: CUE.dollarMorph + 0.25, gain: 0.4 },
  { name: "whoosh", at: CUE.flood, gain: 0.45 },
  { name: "pop", at: CUE.wordmark, gain: 0.35 },
  { name: "pop", at: CUE.button, gain: 0.3 },
];
