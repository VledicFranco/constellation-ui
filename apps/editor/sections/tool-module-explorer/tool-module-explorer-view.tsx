import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@heroui/react";
import { Key } from "react";
import { GraphAreaApi } from "../graph-area";
import { useInitModuleExplorerState, useModuleExplorerState } from "./tool-module-explorer-state";

export default function ToolModuleExplorerView() {

    useInitModuleExplorerState()
    const state = useModuleExplorerState((state) => state)

    const onModuleSelectionChange = (key: Key | null) => {
        const selected = state.modules.find((module) => module.name === key)
        selected && state.selectModule(selected)
    }

    const onAddModule = () => {
        state.selectedModule && GraphAreaApi.addModule(state.selectedModule)
    }

    return <>
        <div className="flex flex-col gap-2">
            <Autocomplete size="sm" label="Modules" placeholder="Search for your module"
                onSelectionChange={onModuleSelectionChange}>
                {state.modules.map((module) => (
                    <AutocompleteItem key={module.name}>{module.name}</AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
        { state.selectedModule && (
            <div className="flex flex-col gap-2 mt-2 pt-2">
                <Card className="max-w-full">
                    <CardHeader className="flex gap-1">
                        {state.selectedModule.metadata.tags.map((tag) => (
                            <Chip key={tag} size="sm" className="mr-2" variant="solid" color="primary">
                                {tag}
                            </Chip>
                        ))}
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <p>{state.selectedModule.metadata.description}</p>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        <Button color="success" variant="bordered" onPress={onAddModule}>Add Module</Button>
                    </CardFooter>
                </Card>
            </div>
        )}
    </>
}
