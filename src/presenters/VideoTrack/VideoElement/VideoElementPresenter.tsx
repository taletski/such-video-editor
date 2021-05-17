import React, { useMemo } from "react";
import isEqual from "lodash.isequal";

import { S } from "./VideoElementPresenter.styles";

interface VideoElementPresenterProps {
  id: string;
  xPosition: number;
  width: number;
  frameWidth: number;
  frameAspectRatio?: number;
  framesSrcs: Array<string>;
  handleDragStart: (e: React.DragEvent) => void;
  handleDragEnd: (e: React.DragEvent) => void;
}

const VideoElementPresenterComponent: React.FC<VideoElementPresenterProps> = ({
  id,
  xPosition,
  width,
  frameWidth,
  frameAspectRatio,
  framesSrcs,
  handleDragStart,
  handleDragEnd,
}) => {
  const frameHeight = useMemo(() => {
    const aspectRatio = frameAspectRatio || 16 / 9;
    return frameWidth / aspectRatio;
  }, [frameWidth, frameAspectRatio]);
  return (
    <>
      <S.Container
        xPosition={xPosition}
        width={width}
        draggable={true}
        id={id}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {framesSrcs.map((src, idx) => (
          <S.Frame
            key={idx}
            src={src}
            width={frameWidth}
            height={frameHeight}
            draggable={false}
          />
        ))}
      </S.Container>
    </>
  );
};

export const VideoElementPresenter = React.memo(
  VideoElementPresenterComponent,
  isEqual
);
