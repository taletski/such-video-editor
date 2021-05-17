import styled from "styled-components";

interface IDragAndDropOverlayProps {
  show: boolean;
}

export const S = {
  DragAndDropOverlay: styled.div<IDragAndDropOverlayProps>`
    display: ${({ show }) => (show ? "auto" : "none")};
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: ${({ theme }) => theme.zIndexes.dragAndDropOverlay};
    background-color: rgba(0, 0, 0, 0.5);
  `,
  Container: styled.div`
    height: 100%;
    width: 100%;
  `,
  TrackContainer: styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    max-width: 100%;
    z-index: ${({ theme }) => theme.zIndexes.videoTrack};
    background-color: ${({ theme }) => theme.sharedColors.background};
    overflow: scroll;
  `,
  Track: styled.div<{ width: number }>`
    height: 100%;
    width: ${({ width }) => width}px;
  `,
};
