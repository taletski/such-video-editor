import React from "react";
import isEqual from "lodash.isequal";
import { IVideoTrackState } from "services/Video/VideoService.types";
import { VideoElementPresenter } from "../VideoElement/VideoElementPresenter";
import { TrackDragEventHandler } from "containers/VideoTrack/VideoTrack.types";

interface IRenderTrackItemsPresenterProps {
  trackState: IVideoTrackState;
  handleDragStart: TrackDragEventHandler<void>;
  handleDragEnd: TrackDragEventHandler<void>;
}

const RenderTrackItemsPresenterComponent: React.FC<IRenderTrackItemsPresenterProps> = ({
  trackState,
  handleDragStart,
  handleDragEnd,
}) => {
  return (
    <>
      {trackState.items.map(
        ({
          id,
          framesSrcs,
          length_px,
          frames_start_px,
          preview_frames_width_px,
        }) => (
          <VideoElementPresenter
            key={id}
            id={id}
            xPosition={frames_start_px}
            width={length_px}
            framesSrcs={framesSrcs}
            frameWidth={preview_frames_width_px}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
        )
      )}
    </>
  );
};

export const RenderTrackItemsPresenter = React.memo(
  RenderTrackItemsPresenterComponent,
  isEqual
);
