import React from "react";
import isEqual from "lodash.isequal";
import { IAppPresenterProps } from "../../containers/App/App.types";
import { S } from "./AppPresenter.styles";
import { PlayButtonPresenter } from "presenters/PlayButton/PlayButtonPresenter";
import { VideoTrack } from "containers/VideoTrack/VideoTrack";

const AppPresenterComponent = React.forwardRef<
  HTMLDivElement,
  IAppPresenterProps
>(({ isPlaying, handlePlayPause }, ref) => {
  return (
    <S.Container>
      <S.VideoContainer>
        <S.VideoWrapper ref={ref} />
      </S.VideoContainer>
      <S.ControlsContainer>
        <S.ControlsPlayButtonContainer>
          <PlayButtonPresenter
            isPlaying={isPlaying}
            handleClick={handlePlayPause}
          />
        </S.ControlsPlayButtonContainer>
        <S.ControlsTrackContainer>
          <VideoTrack />
        </S.ControlsTrackContainer>
      </S.ControlsContainer>
    </S.Container>
  );
});

export const AppPresenter = React.memo(AppPresenterComponent, isEqual);
