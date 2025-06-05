import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@heroui/react";
import { Key } from "react";
import { useInitModuleExplorerState, useModuleExplorerState } from "./tool-module-explorer-state";
import { ModuleNodeSpec } from "@/apps/common/dag-dsl";

interface ToolModuleExplorerViewProps {
    onAddModule: (module: ModuleNodeSpec) => void
}

export default function ToolModuleExplorerView(props: ToolModuleExplorerViewProps) {

    useInitModuleExplorerState()
    const state = useModuleExplorerState((state) => state)

    const onModuleSelectionChange = (key: Key | null) => {
        const selected = state.modules.find((module) => module.metadata.name === key)
        selected && state.selectModule(selected)
    }

    const onAddModule = () => 
        state.selectedModule && props.onAddModule(state.selectedModule)

    return <>
        <div className="flex flex-col gap-2">
            <Autocomplete size="sm" label="Modules" placeholder="Search for your module"
                onSelectionChange={onModuleSelectionChange}>
                {state.modules.map((module) => (
                    <AutocompleteItem key={module.metadata.name}>{module.metadata.name}</AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
        { state.selectedModule && (
            <Card className="mt-4">
                <CardHeader className="flex gap-2">
                    {state.selectedModule.metadata.tags.map((tag) => (
                        <Chip key={tag} size="sm" variant="solid" color="default">{tag}</Chip>
                    ))}
                </CardHeader>
                <Divider />
                <CardBody>
                    <p className="max-w-lg text-wrap">{state.selectedModule.metadata.description}</p>
                </CardBody>
                <Divider />
                <CardFooter>
                    <Button color="success" variant="bordered" onPress={onAddModule}>Add Module</Button>
                </CardFooter>
            </Card>
        )}
    </>
}
