import styled from "styled-components";

export const ContentIndex = styled.div`
  .Mui-disabled.MuiInputBase-input {
    background-color: #efefef;
    color: #555555;
  }
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-height: 100vh;
  background-image: url("/img/covid-bg.svg");
  background-color: #4156fa;
  background-repeat: repeat;
  background-position: center;
  background-size: cover;
  & .container.custom {
    max-width: 600px;
    box-shadow: 0px 0px 3px 3px #293aad;
    padding: 0px;
    background-color: #ffffff;
  }
`;

export const LeftPanel = styled.div`
  background-color: blue;
`;

export const RightPanel = styled.div`
  background-color: white;
`;

export const Header = styled.div`
  background-color: #394fe4;
  width: 100%;
  min-height: 70px;
  display: flex;
  padding: 10px 15px;
  align-items: center;
  justify-content: left;
  & .logo {
    width: 70px;
    margin-right: 15px;
  }
  & .title {
    color: #ffffff;
    font-size: 1.7em;
    margin: 0;
  }
`;
export const Body = styled.div`
  display: block;
  padding: 15px 30px;

  & .temperature-content.active {
    display: flex;
    justify-content: center;
    align-items: center;
    & .content-loader-temperature {
      display: "flex";
      justify-content: flex-start;
      align-items: center;
      & .label {
        display: inline-flex;
        transform: translateY(-6px);
        margin-left: 15px;
        font-weight: bold;
      }
    }
  }

  & .temp {
    pointer-events: none;
  }

  & .success {
    background-color: #b3ffca;
    border-radius: 3px;
  }

  & .warning {
    background-color: #fff2b3;
    border-radius: 3px;
  }

  & .danger {
    background-color: #ffb3b3;
    border-radius: 3px;
  }
`;
