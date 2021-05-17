import React, { useCallback, useMemo, useRef, useState } from "react";
import { VideoTrackPresenter } from "presenters/VideoTrack/VideoTrackPresenter";
import debounce from "lodash.debounce";
import {
  useVideoServiceMethods,
  useVideoTrackState,
} from "services/Video/VideoService.reactAPI";

const DRAG_OVER_VIEWPORT_HANDLER_DELAY = 100;

export const VideoTrack: React.FC = () => {
  type PresenterRefHandle = React.ElementRef<typeof VideoTrackPresenter>;
  const ref = useRef<PresenterRefHandle>(null);
  const [mouseDragOffset, setMouseDragOffset] = useState<number>(0);
  const [
    isUserDraggingOverViewport,
    setisUserDraggingOverViewport,
  ] = useState<boolean>(false);

  const handleDragOverViewport = useMemo(
    () =>
      debounce(
        (e: DragEvent) => {
          /*
           * sets "isUserDraggingOverViewport = true" on the first event (leading call)
           * sets "isUserDraggingOverViewport = false" on the last event (trailing call)
           */
          setisUserDraggingOverViewport(
            (isUserDraggingOverViewport) => !isUserDraggingOverViewport
          );
        },
        DRAG_OVER_VIEWPORT_HANDLER_DELAY,
        { leading: true, trailing: true }
      ),
    []
  );

  const trackState = useVideoTrackState();
  const { handleDropNewVideo, handleMoveVideo } = useVideoServiceMethods();

  const handleDropNewVideoOnTrack = useCallback(
    (event: React.DragEvent, trackClientPosition?: DOMRect) => {
      if (trackClientPosition?.x) {
        const dropXPositionOnTrackPx = event.clientX - trackClientPosition.x;
        handleDropNewVideo(dropXPositionOnTrackPx, event.dataTransfer.files[0]);
      }
    },
    [handleDropNewVideo]
  );

  const makeDragHandlers = useCallback(() => {
    const handleDragStart = (event: React.DragEvent) => {
      const target = event.target as HTMLElement;
      target.style.opacity = "0.4";
      const elementClientX = target.getBoundingClientRect().x;
      const mouseClientX = event.clientX;
      setMouseDragOffset(elementClientX - mouseClientX);
    };

    const handleDragEnd = (
      event: React.DragEvent,
      trackClientPosition?: DOMRect
    ) => {
      const target = event.target as HTMLElement;
      target.style.opacity = "1";

      if (trackClientPosition?.x !== undefined) {
        const newVideoStartPosition =
          event.clientX + mouseDragOffset - trackClientPosition.x;
        const videoId = target.id;
        handleMoveVideo(newVideoStartPosition, videoId);
      }
    };

    return {
      handleDragStart,
      handleDragEnd,
    };
  }, [handleMoveVideo, mouseDragOffset]);

  return (
    <VideoTrackPresenter
      ref={ref}
      trackState={trackState}
      isUserDraggingOverViewport={isUserDraggingOverViewport}
      handleDragOverViewport={handleDragOverViewport}
      handleDropNewVideoOnTrack={handleDropNewVideoOnTrack}
      makeDragHandlers={makeDragHandlers}
    />
  );
};
