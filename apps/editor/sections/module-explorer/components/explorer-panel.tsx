import { Key, useEffect } from "react"
import { useModuleExplorerState } from "../module-explorer-state"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Card, Chip, CardBody, CardFooter, CardHeader, Divider, Link, Button } from "@heroui/react";
import { Panel } from "@xyflow/react";
import { CSSProperties, useState } from "react";
import { ExplorersModule } from "../module-explorer-dsl";
import { GraphAreaApi } from "../../graph-area";

interface ExplorerPanelProperties {
    modules: ExplorersModule[]
}

export default function ExplorerPanel({ modules }: ExplorerPanelProperties) {

    //useInitialModuleBarLoader()

    const [selectedModule, setSelectedModule] = useState<ExplorersModule | null | undefined>(null);

    const onModuleSelectionChange = (key: Key | null) => {
        const selected = modules.find((module) => module.name === key);
        setSelectedModule(selected);
    };

    const onAddModule = () => {
        if (selectedModule) GraphAreaApi.addModule(selectedModule)
    }

    return (
        <Panel
            id="explorer-panel"
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
                        <AutocompleteItem id={animal.name} key={animal.name}>{animal.name}</AutocompleteItem>
                    ))}
                </Autocomplete>
            </div>
            {selectedModule && (
                <div className="flex flex-col gap-2 mt-2 pt-2">
                    <Card className="max-w-full">
                        <CardHeader className="flex gap-1">
                            {selectedModule.metadata.tags.map((tag) => (
                                <Chip key={tag} size="sm" className="mr-2" variant="solid" color="primary">
                                    {tag}
                                </Chip>
                            ))}
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <p>{selectedModule.metadata.description}</p>
                        </CardBody>
                        <Divider />
                        <CardFooter>
                            <Button color="success" variant="bordered" onPress={onAddModule}>Add Module</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </Panel>
    );
}


/*
const ModuleExplorerView = ({ className }: { className?: string }) => {
    useInitialModuleBarLoader() 
    const modules = useModuleBarState((state) => state.modules)
    return <div className={className}>
        {modules.map((module) =>
            <ModuleItem key={module.name} module={module} />
        )}
    </div>
}
*/
