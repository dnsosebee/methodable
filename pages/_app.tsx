// pages/_app.tsx
import "../client/styles/globalStyles.css";
import "../client/styles/tailwind.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
