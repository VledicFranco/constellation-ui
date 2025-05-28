import { Card, CardFooter, CardHeader, Link } from "@heroui/react";
import { useEffect, useState } from "react";

import { DagMetadata } from "../common/dag-dsl";
import BrowserDagsBackendApi from "./browser-dags-backend-api";

function DagCard({ name, metadata }: { name: string, metadata: DagMetadata }) {

    const editorLink = `/editor/${name}`;

    return (
        <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                    <p className="text-lg">{name}</p>
                    <p className="text-small text-default-500">{metadata.version}</p>
                    <p className="text-small text-default-500">{metadata.description}</p>
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

export default function BrowserDags() {

    const [dags, setDags] = useState<Record<string, DagMetadata>>({})
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDags = async () => {
            try {
                const data = await BrowserDagsBackendApi.getDags();
                setDags(data);
            } catch (error) {
                console.error('Failed to load DAGs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDags();
    }, []);

    return <>
        {loading ? (
            <div className="flex justify-center items-center p-4">
                Loading...
            </div>
        ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(dags).map(([name, metadata], index) => (
                    <div key={index} className="flex justify-center">
                        <DagCard metadata={metadata} name={name} />
                    </div>
                ))}
            </div>
        )}
    </>
};