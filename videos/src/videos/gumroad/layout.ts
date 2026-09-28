/**
 * Frame layout (1080x1920). Content stays inside y 300..1560 so the Reels and
 * TikTok overlays (top bar, caption, side buttons) never cover it.
 */
export const WORDS_Y = 470; // punchline row above the card
export const TAGLINE_Y = 900; // punchlines on the pink flood
export const HERO = { x: 540, y: 914 }; // the liquid "0" and "$1", on the cover's center

/** The product card, a twin of the card on gumroad.com (4 px lines at this scale). */
export const CARD = { x: 140, y: 690, w: 800, h: 780, line: 4, radius: 20, shadow: 12 } as const;
const inner = { x: CARD.x + CARD.line, y: CARD.y + CARD.line };
export const COVER = { x: inner.x, y: inner.y, w: 792, h: 440 } as const;
export const INFO = { top: 444, h: 192 } as const; // inside the card border
export const ROW = { top: 640, h: 132, split: 542 } as const; // Add to cart | price
/** Screen centers of the bottom row's two cells (Add to cart, price tag). */
export const CART = { x: inner.x + ROW.split / 2, y: inner.y + ROW.top + ROW.h / 2 };
export const PRICE = { x: inner.x + ROW.split + 4 + (792 - ROW.split - 4) / 2, y: CART.y };
export const TAG = { w: 170, h: 80 } as const;
