import { Button, Card, CardBody, CardFooter, CardHeader, Input, Link, ScrollShadow } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

import { SquarePlus, SquarePen } from "lucide-react";
import { ComponentMetadata } from "../common/dag-dsl";
import BrowserDagsBackendApi from "./browser-dags-backend-api";
import * as R from "remeda";

function capitalizeFirstLetter(val: string): string {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

function removeEmptySpaces(val: string): string {
    return String(val).replace(/\s+/g, "")
}

function removeSpecialCharacters(val: string): string {
    return String(val).replace(/[^a-zA-Z0-9]/g, "")
}

function removeLeadingNumbers(val: string): string {
    return String(val).replace(/^[0-9]+/, "")
}

function sanitizeDagName(name: string): string {
    return R.pipe(
        name,
        removeEmptySpaces,
        removeSpecialCharacters,
        removeLeadingNumbers,
        capitalizeFirstLetter
    )
}

function CreateDagCard() {
    const [name, setName] = useState<string>("")
    const [isInvalid, setIsInvalid] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const onNameChange = useCallback((value: string) => {
        const sanitizedValue = sanitizeDagName(value)
        setName(sanitizedValue)
        setIsInvalid(false)
        setError(null)
    }, []);

    const onCreateDag = useCallback(async () => {
        if (name === "") {
            setIsInvalid(true)
            setError("DAG name cannot be empty");
            return;
        }
        setIsLoading(true)
        const response = await BrowserDagsBackendApi.createDag(name)
        if (response.tag === "exists") {
            setIsLoading(false)
            setIsInvalid(true)
            setError(response.message)
        } else if (response.tag === "created") {
            setIsLoading(false)
            setIsInvalid(false)
            setError(null)
            setName("")
            window.location.href = `/editor/${name}`
        }
    }, [name]);

    return (
        <Card>
            <CardHeader className="h-[100px] flex items-center">
                <Input
                    name="DAG Name"
                    size="md"
                    label="DAG Name"
                    defaultValue="DAG Name"
                    errorMessage={error}
                    color={isInvalid ? "danger" : "default"}
                    isInvalid={isInvalid}
                    isDisabled={isLoading}
                    value={name}
                    onValueChange={onNameChange}
                />
            </CardHeader>
            <CardBody className="h-[150px]">
            </CardBody>
            <CardFooter className="flex justify-center">
                <Button 
                    className="w-[100px]" 
                    startContent={<SquarePlus size={20} />}
                    isLoading={isLoading}
                    onPress={onCreateDag}
                >Create</Button>
            </CardFooter>
        </Card>
    )
}

function DagCard({ name, metadata }: { name: string, metadata: ComponentMetadata }) {
    return (
        <Card>
            <CardHeader className="h-[100px] flex items-center">
                <div className="flex flex-col gap-1">
                    <p className="text-lg">{name}</p>
                    <p className="text-small text-default-500">{metadata.version}</p>
                </div>
            </CardHeader>
            <CardBody className="h-[150px]">
                <ScrollShadow className="h-[150px]">
                    <p className="text-small text-default-500 pt-2">{metadata.description}</p>
                </ScrollShadow>
            </CardBody>
            <CardFooter className="flex justify-center">
                <Button 
                    className="w-[100px]" 
                    startContent={<SquarePen size={15} />}
                    as={Link}
                    href={`/editor/${name}`}>Edit</Button>
            </CardFooter>
        </Card>
    )
}

export default function BrowserDags() {

    const [dags, setDags] = useState<Record<string, ComponentMetadata>>({})
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
    }, [])

    return <>
        {loading ? (
            <div className="flex justify-center items-center p-4">
                Loading...
            </div>
        ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
                <CreateDagCard />
                {Object.entries(dags).map(([name, metadata], index) => (
                    <DagCard key={index} metadata={metadata} name={name} />
                ))}
            </div>
        )}
    </>
};