import { useEffect, useState } from "react";
import * as R from "remeda";
import { Card, CardHeader, CardBody, CardFooter, Divider, Link } from "@heroui/react";

import HomeBackendApi from "./home-backend-api";
import { DagSpec, getDagInputs } from "../common/dag-dsl";

function DagCard({ dag }: { dag: DagSpec }) {

  const desc = dag.description || "No description available";
  const editorLink = `/editor/${dag.name}`;

  const dagInputs = getDagInputs(dag);
  console.log("dagInputs", dagInputs);
  const groupedInputs = R.groupBy(dagInputs, ([id, inputSpec]) => inputSpec.name);
  console.log("groupedInputs", groupedInputs);

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-lg">{dag.name}</p>
          {<p className="text-small text-default-500">{desc}</p>}
        </div>
      </CardHeader>

      <CardFooter>
        <Link isBlock href={editorLink}>
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function HomeView() {

  {/* Using React's useState and useEffect to handle async data */ }
  const [dags, setDags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDags = async () => {
      try {
        const data = await HomeBackendApi.getDags();
        setDags(data);
      } catch (error) {
        console.error('Failed to load DAGs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDags();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center p-4">
          Loading...
        </div>
      ) : (
        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
          {dags.map((dag, index) => (
            <div key={index} className="flex justify-center">
              <DagCard dag={dag} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};