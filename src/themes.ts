import { DefaultTheme } from "styled-components";

const dragAndDropOverlayZIndex = 999;
const videoTrackZIndex = dragAndDropOverlayZIndex + 1;
const videoOnTrackZIndex = videoTrackZIndex + 1;
const videoProgressPositionCursorZIndex = videoOnTrackZIndex + 1;

const defaultThemeColors = {
  ebonyClay: "#222831",
  pickledBluewood: "#30475E",
  sandyBrown: "#f2a365",
  gallery: "#ececec",
  carnation: "#f55c47",
};

export const defaultTheme: DefaultTheme = {
  playButton: {
    colors: {
      background: defaultThemeColors.sandyBrown,
    },
  },
  videosTrack: {
    colors: {
      videoProgressCursor: defaultThemeColors.carnation,
    },
  },
  sharedColors: {
    background: defaultThemeColors.ebonyClay,
    lines: defaultThemeColors.pickledBluewood,
    text: defaultThemeColors.gallery,
  },
  zIndexes: {
    dragAndDropOverlay: `${dragAndDropOverlayZIndex}`,
    videoTrack: `${videoTrackZIndex}`,
    videoOnTrack: `${videoOnTrackZIndex}`,
    videoProgressPositionCursor: `${videoProgressPositionCursorZIndex}`,
  },
};
