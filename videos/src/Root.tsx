import { Composition } from "remotion";

import { DURATION } from "./videos/gumroad/cues";
import { GumroadAd, type FilmProps } from "./videos/gumroad/Film";

export function Root() {
  return (
    <Composition
      id="GumroadAd"
      component={GumroadAd}
      width={1080}
      height={1920}
      fps={60}
      durationInFrames={Math.round(DURATION * 60)}
      defaultProps={{ fps: 60, debug: false } satisfies FilmProps}
      calculateMetadata={({ props }) => ({ fps: props.fps, durationInFrames: Math.round(DURATION * props.fps) })}
    />
  );
}
