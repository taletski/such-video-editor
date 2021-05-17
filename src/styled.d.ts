import "styled-components";

// and extend them!
declare module "styled-components" {
  export interface DefaultTheme {
    playButton: {
      colors: {
        background: string;
      };
    };
    videosTrack: {
      colors: {
        videoProgressCursor: string;
      };
    };
    sharedColors: {
      background: string;
      text: string;
      lines: string;
    };
    zIndexes: {
      dragAndDropOverlay: string;
      videoTrack: string;
      videoOnTrack: string;
      videoProgressPositionCursor: string;
    };
  }
}
