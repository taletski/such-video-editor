import styled from "styled-components";

export const S = {
  Button: styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: ${({ theme }) => theme.playButton.colors.background};
    outline: 0;
    border: none;
    border-radius: 2px;

    width: 100%;
    height: 100%;
  `,
};
