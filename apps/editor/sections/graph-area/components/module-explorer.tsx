import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Card, CardBody, CardFooter, CardHeader, Divider, Link } from "@heroui/react";
import { Panel } from "@xyflow/react";
import { CSSProperties, useState } from "react";

const modules = [
    { name: "Whale", key: "whale", description: "Diverse group of fully aquatic placental marine mammals" },
    { name: "Otter", key: "otter", description: "A carnivorous mammal in the subfamily Lutrinae" },
    { name: "Crocodile", key: "crocodile", description: "A large semiaquatic reptile" },
];

export default function ModuleExplorer() {

    const [selectedModule, setSelectedModule] = useState(null);

    const onModuleSelectionChange = (key: String | null) => {
        const selected = modules.find((module) => module.key === key);
        setSelectedModule(selected);
    };

    return (
        <Panel
            position="top-right"
            aria-label="Module Explorer"
            className="p-2 border-gray-300 border-1 rounded-md shadow-md w-60"
            style={{
                'right': '50px',
                'width': '500px',
                'backgroundColor': 'rgba(255, 255, 255, 0.8)',
                'height': 'auto',
            } as CSSProperties}>
            <div className="flex flex-col gap-2">
                <Autocomplete size="sm" label="Modules" placeholder="Search for your module"
                    onSelectionChange={onModuleSelectionChange}>
                    {modules.map((animal) => (
                        <AutocompleteItem key={animal.key}>{animal.name}</AutocompleteItem>
                    ))}
                </Autocomplete>
            </div>
            {selectedModule && (
                <div className="flex flex-col gap-2 mt-2 pt-2">
                    <Card className="max-w-full">
                        <CardHeader className="flex gap-3">
                            <div className="flex flex-col">
                                <p className="text-md">HeroUI</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <p>Make beautiful websites regardless of your design experience.</p>
                        </CardBody>
                        <Divider />
                        <CardFooter>
                            <Link isExternal showAnchorIcon href="https://github.com/heroui-inc/heroui">
                                Visit source code on GitHub.
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Panel>

    );
}