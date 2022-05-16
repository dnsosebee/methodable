// pages/_app.tsx
import "../client/styles/tailwind.css";
import { UserProvider } from "@auth0/nextjs-auth0";
import Layout from "../client/components/Layout";
import { ApolloProvider } from "@apollo/client";
import client from "../client/lib/apollo";

import "../client/styles/globalStyles.css";

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ApolloProvider client={client}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ApolloProvider>
    </UserProvider>
  );
}

export default MyApp;
