import React from "react";
import Head from "next/head";
import Image from "next/image";

const Homepage = () => {
  return (
    <>
      <Head>
        <title>Lionskins</title>
      </Head>

      <img src="/images/logo.svg" alt="" className="logo" />
      <h1>Lionskins has come to an end</h1>
      <p>
        After five years of activity, it is time to end the adventure. Lionskins
        was never made with the intent of making a profit, but the cost of
        maintenance was too high in comparison to the number of visitors we
        received. There are many similar websites, way better ranked on search
        engines, and we never managed to have an audience large enough to
        compensate for the costs.
      </p>

      <p>Thank you for staying with us during that time!</p>

      <p>The Lionskins Team</p>
    </>
  );
};

export default Homepage;
