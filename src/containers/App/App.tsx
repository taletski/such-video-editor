import React, { useCallback, useEffect, useRef } from "react";
import { AppPresenter } from "presenters/App/AppPresenter";
import {
  useVideoIsPlaying,
  useVideoServiceMethods,
} from "services/Video/VideoService.reactAPI";

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlaying = useVideoIsPlaying();
  const { connect, playTrack, stopResetTrack } = useVideoServiceMethods();

  const handlePlayPause = useCallback(
    (isPlaying: boolean) => {
      isPlaying ? stopResetTrack() : playTrack();
    },
    [playTrack, stopResetTrack]
  );

  useEffect(() => {
    containerRef.current && connect(containerRef.current);
  }, [containerRef, connect]);

  return (
    <AppPresenter
      ref={containerRef}
      isPlaying={isPlaying}
      handlePlayPause={handlePlayPause}
    />
  );
};
