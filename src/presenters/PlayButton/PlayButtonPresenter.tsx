import React, { useCallback } from "react";
import isEqual from "lodash.isequal";
import { S } from "./PlayButtonPresenter.styles";

interface IPlayButtonPresenterProps {
  isPlaying: boolean;
  handleClick: (isPlaying: boolean) => void;
}

const PlayButtonPresenterComponent: React.FC<IPlayButtonPresenterProps> = ({
  isPlaying,
  handleClick,
}) => {
  const handleButtonClick = useCallback(() => handleClick(isPlaying), [
    isPlaying,
    handleClick,
  ]);

  return (
    <S.Button onClick={handleButtonClick}>{isPlaying ? "◼" : "►"}</S.Button>
  );
};

export const PlayButtonPresenter = React.memo(
  PlayButtonPresenterComponent,
  isEqual
);
