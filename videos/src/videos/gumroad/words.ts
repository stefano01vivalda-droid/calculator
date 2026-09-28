import type { Card } from "../../kit/punchlines";
import { b } from "./cues";
import { TAGLINE_Y, WORDS_Y } from "./layout";

/**
 * Every line is Gumroad's own: the hero headline ("Go from 0 to $1"), a
 * creator's words from their features page ("I upload a file, set a price,
 * and I can start selling"), and their closing tagline.
 */
const card = (words: [string, number][][], out: number, y = WORDS_Y, size = 120): Card => ({
  lines: words.map((line) => line.map(([text, at]) => ({ text, at }))),
  out,
  y,
  size,
});

export const CARDS: Card[] = [
  card([[["Go", b(1, 2)], ["from", b(1, 2, 0.5)]]], b(2, 1) - 0.16),
  card([[["Upload", b(2, 1)], ["a file.", b(2, 2)]]], b(3, 1) - 0.16),
  card([[["Set", b(3, 1)], ["a price.", b(3, 2)]]], b(4, 1) - 0.16),
  card([[["Start", b(4, 1)], ["selling.", b(4, 2)]]], b(5, 1) - 0.16),
  card([[["Go", b(5, 1)], ["from", b(5, 1, 0.5)], ["0", b(5, 2)], ["to", b(5, 2, 0.5)]]], b(6, 1) - 0.16),
  card([[["Share", b(6, 1, 0.5)], ["your", b(6, 2)], ["work.", b(6, 2, 0.5)]]], b(6, 4) - 0.16, TAGLINE_Y, 116),
  card(
    [
      [["Someone", b(6, 4)], ["out", b(6, 4, 0.5)], ["there", b(7, 1)]],
      [["needs", b(7, 1, 0.5)], ["it.", b(7, 2)]],
    ],
    b(7, 4) - 0.16,
    TAGLINE_Y,
    116,
  ),
];
