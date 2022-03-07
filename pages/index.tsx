// /pages/index.tsx
import Head from "next/head";
import { gql, useQuery } from "@apollo/client";

const StepsQuery = gql`
  query {
    steps {
      id
      text
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(StepsQuery);

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
        {data.steps.map((step) => (
          <p key={step.id}>{step.text}</p>
        ))}
      </div>
    </div>
  );
}
