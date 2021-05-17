import styled from "styled-components";

export const S = {
  Container: styled.main`
    display: flex;
    flex-direction: column;
    align-items: stretch;

    height: 100vh;
    width: 100vw;

    background-color: ${({ theme }) => theme.sharedColors.background};
  `,
  VideoContainer: styled.section`
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-height: 0;

    & video {
      width: 100%;
      max-height: 100%;
      background-color: black;
    }
  `,
  VideoWrapper: styled.div`
    position: relative;
    width: 100%;
  `,
  ControlsContainer: styled.section`
    display: flex;
    align-items: stretch;
    flex: 0 0 50px;
  `,
  ControlsPlayButtonContainer: styled.div`
    flex: 0 0 50px;
  `,
  ControlsTrackContainer: styled.div`
    flex: 1 1 auto;
    min-width: 0;

    border: 1px solid ${({ theme }) => theme.sharedColors.lines};
    box-sizing: border-box;
  `,
};
