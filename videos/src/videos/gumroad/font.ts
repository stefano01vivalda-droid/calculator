import { continueRender, delayRender, staticFile } from "remotion";

/** Loads the local font before any frame renders (no network at render time). */
const handle = delayRender("Loading Instrument Sans");
const face = new FontFace("Instrument Sans", `url(${staticFile("fonts/InstrumentSans.woff2")}) format("woff2")`, { weight: "400 700" });
face
  .load()
  .then(() => {
    document.fonts.add(face);
    continueRender(handle);
  })
  .catch((error: unknown) => {
    console.error(error);
    continueRender(handle);
  });
