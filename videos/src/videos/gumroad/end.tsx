import { Easing } from "remotion";

import { step } from "../../kit/spring";
import { clamp01 } from "../../kit/time";
import { CUE } from "./cues";
import { wobble } from "./liquid";
import { C } from "./tokens";

const land = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * End card on the pink flood. The name is typeset (the official logo file
 * could not be fetched); the button is gumroad.com's own black "Start selling".
 */
export function EndCard({ t }: { t: number }) {
  if (t < CUE.wordmark - 0.05) return null;
  const name = land(clamp01((t - CUE.wordmark) / 0.3));
  const squash = wobble(t, CUE.wordmark, 0.1, 18, 6);
  const button = step(t - CUE.button, { stiffness: 260, damping: 16 });
  const url = land(clamp01((t - CUE.url) / 0.3));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, translate: `0 ${-50 + (1 - name) * 36}%`, textAlign: "center", fontSize: 200, fontWeight: 600, letterSpacing: "-0.03em", color: C.black, opacity: name, filter: name < 1 ? `blur(${(1 - name) * 16}px)` : undefined, scale: `${1 + squash} ${1 - squash}` }}>
        Gumroad
      </div>
      {button > 0.001 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center", translate: "0 -50%" }}>
          <div style={{ padding: "30px 66px", background: C.black, color: C.white, fontSize: 60, fontWeight: 500, borderRadius: 8, scale: String(button) }}>Start selling</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, translate: `0 ${-50 + (1 - url) * 30}%`, textAlign: "center", fontSize: 52, color: C.black, opacity: url, filter: url < 1 ? `blur(${(1 - url) * 12}px)` : undefined }}>
        gumroad.com
      </div>
    </>
  );
}
