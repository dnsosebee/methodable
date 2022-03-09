// /pages/index.tsx
import Head from "next/head";
import { gql, useQuery } from "@apollo/client";

const blocksQuery = gql`
  query {
    blocks {
      id
      humanText
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(blocksQuery);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;
  console.log(data);
  return (
    <div>
      <Head>
        <title>Intensh</title>
        <link rel="icon" href="/intensh-logo.png" />
      </Head>
      <div>
        {data.blocks.map((block) => (
          <p key={block.id}>{block.humanText}</p>
        ))}
      </div>
    </div>
  );
}
