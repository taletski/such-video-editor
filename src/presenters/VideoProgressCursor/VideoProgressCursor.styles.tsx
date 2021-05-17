import styled from "styled-components";

export const S = {
  Cursor: styled.div`
    width: 1px;
    height: 100%;
    position: absolute;
    z-index: ${({ theme }) => theme.zIndexes.videoProgressPositionCursor};
    left: 0;
    top: 0;
    background-color: ${({ theme }) =>
      theme.videosTrack.colors.videoProgressCursor};
  `,
};
