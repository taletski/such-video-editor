import React, { useImperativeHandle, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import isEqual from "lodash.isequal";
import { S } from "./VideoTrackPresenter.styles";
import { GlobalDragAndDropListener } from "presenters/VideoTrack/GlobalDragAndDropListener/GlobalDragAndDropListener";
import {
  IVideoTrackPresenterHandle,
  IVideoTrackPresenterProps,
} from "containers/VideoTrack/VideoTrack.types";
import { RenderTrackItemsPresenter } from "./RenderTrackItems/RenderTrackItems";
import { VideoProgressCursor } from "containers/VideoProgressCursor/VideoProgressCursor";

const ROOT_NODE = document.getElementById("root");

const VideoTrackPresenterComponent = React.forwardRef<
  IVideoTrackPresenterHandle,
  IVideoTrackPresenterProps
>(
  (
    {
      trackState,
      isUserDraggingOverViewport,
      handleDragOverViewport,
      handleDragOverTrack,
      handleDropNewVideoOnTrack,
      makeDragHandlers,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const trackBoundingClientRect = trackRef.current?.getBoundingClientRect();

    useImperativeHandle(ref, () => ({
      getContainer: () => containerRef.current,
      getTrack: () => trackRef.current,
    }));

    const { handleDragStart, handleDragEnd } = useMemo(
      () => makeDragHandlers(),
      [makeDragHandlers]
    );

    return (
      <>
        <S.Container>
          <S.TrackContainer ref={containerRef} onDragOver={handleDragOverTrack}>
            <VideoProgressCursor />
            <S.Track
              ref={trackRef}
              width={trackState.length_px}
              onDrop={(e) =>
                handleDropNewVideoOnTrack(e, trackBoundingClientRect)
              }
            >
              <RenderTrackItemsPresenter
                trackState={trackState}
                handleDragStart={(e) =>
                  handleDragStart(e, trackBoundingClientRect)
                }
                handleDragEnd={(e) => handleDragEnd(e, trackBoundingClientRect)}
              />
            </S.Track>
          </S.TrackContainer>
        </S.Container>

        <GlobalDragAndDropListener
          handleDragOverViewport={handleDragOverViewport}
        />
        {ROOT_NODE &&
          ReactDOM.createPortal(
            <S.DragAndDropOverlay show={isUserDraggingOverViewport} />,
            ROOT_NODE
          )}
      </>
    );
  }
);

export const VideoTrackPresenter = React.memo(
  VideoTrackPresenterComponent,
  isEqual
);
