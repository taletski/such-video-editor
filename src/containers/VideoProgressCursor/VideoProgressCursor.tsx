import { VideoProgressCursorPresenter } from "presenters/VideoProgressCursor/VideoProgressCursor";
import { useVideoCursorPositionPx } from "services/Video/VideoService.reactAPI";

export const VideoProgressCursor: React.FC = () => {
  const cursorPositionPx = useVideoCursorPositionPx();

  return <VideoProgressCursorPresenter xPositionPx={cursorPositionPx} />;
};
