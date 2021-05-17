import React from "react";
import isEqual from "lodash.isequal";
import { S } from "./VideoProgressCursor.styles";
import { IVideoProgressCursorPresenterProps } from "containers/VideoProgressCursor/VideoProgressCursorPx.types";

const VideoProgressCursorPresenterComponent: React.FC<IVideoProgressCursorPresenterProps> = ({
  xPositionPx,
}) => {
  return (
    <S.Cursor
      style={{ transform: `translate3d(${xPositionPx}px, 0px, 0px)` }}
    />
  );
};

export const VideoProgressCursorPresenter = React.memo(
  VideoProgressCursorPresenterComponent,
  isEqual
);
