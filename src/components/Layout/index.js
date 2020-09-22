import React from "react";
import { GlobalStyle } from "../globalstyles/GlobalStyles";
import { Helmet } from "react-helmet";

export default ({ title = "Gensi", children, ...props }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
          integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
          crossorigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css"
        />
      </Helmet>
      <GlobalStyle />
      {children}
    </>
  );
};
