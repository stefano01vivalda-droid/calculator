/**
 * Gumroad's look, sampled from gumroad.com (screenshot pixels and the page's
 * computed styles, 2026-09-28). Hex only: anything that animates needs hex.
 */
export const C = {
  bg: "#F4F4F0", // page background
  white: "#FFFFFF", // header and card surfaces
  black: "#000000", // text, lines, primary "Start selling" button
  pink: "#FF90E8", // coins, price tags, accent
  teal: "#23A093", // illustration fill (product covers, avatars)
} as const;

/** Stand-in for ABC Favorit (Gumroad's commercial face). See public/fonts/README.md. */
export const FONT = '"Instrument Sans", sans-serif';

export const W = 1080;
export const H = 1920;

/** Pink as 0..1 channels, for the liquid filter's color matrix. */
export const PINK_RGB = [0xff / 255, 0x90 / 255, 0xe8 / 255] as const;
