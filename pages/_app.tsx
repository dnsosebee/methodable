// pages/_app.tsx
import Head from "next/head";
import "../client/styles/globalStyles.css";
import "../client/styles/tailwind.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Methodable</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
