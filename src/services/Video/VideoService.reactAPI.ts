import { useEffect, useMemo, useState } from "react";
import { IVideoTrackState } from "./VideoService.types";
import { VideoServiceDummyImpl } from "./VideoServiceDummyImpl";

export const useVideoServiceMethods = () => {
  const {
    connect,
    handleDropNewVideo,
    handleMoveVideo,
    playTrack,
    stopResetTrack,
  } = useMemo(() => VideoServiceDummyImpl.getInstance(), []);

  const returnMethods = useMemo(
    () => ({
      connect,
      handleDropNewVideo,
      handleMoveVideo,
      playTrack,
      stopResetTrack,
    }),
    [connect, handleDropNewVideo, handleMoveVideo, playTrack, stopResetTrack]
  );

  return returnMethods;
};

export type TSubscriberSetState<S> = (newState: S) => void;
export type TSubscribe<S> = (setter: TSubscriberSetState<S>) => void;
export type TUnsubscribe<S> = (setter: TSubscriberSetState<S>) => void;
export type TUseObservableState<S> = () => S;

export const createObservableStateHook = <S>(
  initialValue: S,
  subscribe: TSubscribe<S>,
  unsubscribe: TUnsubscribe<S>
): TUseObservableState<S> => () => {
  const [hookState, setHookState] = useState<S>(initialValue);

  useEffect(() => {
    const setter = (state: S) => {
      setHookState(state);
    };

    subscribe(setter);

    return () => {
      unsubscribe(setter);
    };
  });

  return hookState;
};

const {
  initialTrackLengthPx,
  subscribeOnTrackState,
  unsubscribeFromTrackState,
  subscribeOnVideoProgressBarPositionPx,
  unsubscribeFromVideoProgressBarPositionPx,
  subscribeOnIsPlayingTrack,
  unsubscribeFromIsPlayingTrack,
} = VideoServiceDummyImpl.getInstance();

export const useVideoTrackState = createObservableStateHook<IVideoTrackState>(
  {
    items: [],
    length_px: initialTrackLengthPx,
  },
  subscribeOnTrackState,
  unsubscribeFromTrackState
);

export const useVideoCursorPositionPx = createObservableStateHook<number>(
  0,
  subscribeOnVideoProgressBarPositionPx,
  unsubscribeFromVideoProgressBarPositionPx
);

export const useVideoIsPlaying = createObservableStateHook<boolean>(
  false,
  subscribeOnIsPlayingTrack,
  unsubscribeFromIsPlayingTrack
);
