// /pages/index.tsx
import Head from "next/head";
import { gql, useQuery } from "@apollo/client";

// const AllLinksQuery = gql`
//   query {
//     links {
//       id
//       title
//       url
//       description
//       imageUrl
//       category
//     }
//   }
// `;

export default function Home() {
  // const { data, loading, error } = useQuery(AllLinksQuery);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Oh no... {error.message}</p>;

  return (
    <div>
      <Head>
        <title>Intensh</title>
        <link rel="icon" href="/intensh-logo.png" />
      </Head>
    </div>
  );
}
