export interface IVideo {
  id: string;
  src: string;
  framesSrcs: Array<string>;
  start_ms: number;
  end_ms: number;
  duration_ms: number;
  frames_start_px: number;
  frames_end_px: number;
  length_px: number;
  preview_frames_width_px: number;
  preview_height_width_px: number;
  processFile: () => Promise<void>;
  applyOffsetMs: (ms: number) => void;
  applyOffsetPx: (ms: number) => void;
  overlapsWith: (video: IVideo) => boolean;
}

export type IVideoTrackState = {
  items: Array<IVideo>;
  length_px: number;
};

export type TSeIVideoProgressPositionPx = (positionPx: number) => void;
export type TSetTrackState = (state: IVideoTrackState) => void;
export type TSetIsPlayingTrack = (isPlayingTrack: boolean) => void;

export interface IVideoService {
  initialTrackLengthPx: number;
  connect: (container: HTMLDivElement) => Promise<void>;
  playTrack: () => Promise<void>;
  stopResetTrack: () => Promise<void>;
  handleDropNewVideo: (
    dropXStartCoordinateInTrackPx: number,
    video: File
  ) => Promise<void>;
  handleMoveVideo: (
    newXStartCoordinateInTrackPx: number,
    videoId: string
  ) => Promise<void>;
  subscribeOnVideoProgressBarPositionPx: (
    setter: TSeIVideoProgressPositionPx
  ) => void;
  unsubscribeFromVideoProgressBarPositionPx: (
    setter: TSeIVideoProgressPositionPx
  ) => void;
  subscribeOnTrackState: (setter: TSetTrackState) => void;
  unsubscribeFromTrackState: (setter: TSetTrackState) => void;
  subscribeOnIsPlayingTrack: (setter: TSetIsPlayingTrack) => void;
  unsubscribeFromIsPlayingTrack: (setter: TSetIsPlayingTrack) => void;
}
