import styled from "styled-components";

export const S = {
  Container: styled.div<{ xPosition: number; width: number }>`
    display: flex;
    align-items: center;
    position: absolute;
    z-index: ${({ theme }) => theme.zIndexes.videoOnTrack};
    left: ${({ xPosition }) => xPosition}px;
    height: 100%;
    width: ${({ width }) => width}px;
    cursor: move;
    overflow-x: hidden;
    box-sizing: border-box;
    border: 1px solid;
    border-color: ${({ theme }) => theme.sharedColors.lines};
    border-radius: 5px;
  `,
  Frame: styled.img``,
};
