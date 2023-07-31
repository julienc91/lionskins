import React from "react";
import "../assets/css/index.scss";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
};

export default MyApp;
