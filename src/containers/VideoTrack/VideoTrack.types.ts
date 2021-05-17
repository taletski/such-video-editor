import React from "react";
import { IVideoTrackState } from "services/Video/VideoService.types";

export type TrackDragEventHandler<R> = (
  e: React.DragEvent,
  trackClientPosition?: DOMRect
) => R;

export interface IVideoTrackPresenterProps {
  trackState: IVideoTrackState;
  isUserDraggingOverViewport: boolean;
  handleDragOverViewport: (e: DragEvent) => void;
  handleDropNewVideoOnTrack: TrackDragEventHandler<void>;
  handleDragOverTrack?: TrackDragEventHandler<void>;
  makeDragHandlers: () => {
    handleDragStart: TrackDragEventHandler<void>;
    handleDragEnd: TrackDragEventHandler<void>;
  };
}

export interface IVideoTrackPresenterHandle {
  getContainer: () => HTMLDivElement | null;
  getTrack: () => HTMLDivElement | null;
}

export type IVideo = {
  video: Blob;
  frames: Array<Blob>;
  time: {
    positionOnTrackMs: number;
    lengthMs: number;
  };
  coordinates: {
    xStartOnTrackPx: number;
    xLengthOnTrackPx: number;
  };
};
