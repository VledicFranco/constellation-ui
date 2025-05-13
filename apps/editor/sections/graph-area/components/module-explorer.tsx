import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Panel } from "@xyflow/react";
import { CSSProperties } from "react";

const modules = [
    {
        label: "Whale",
        key: "whale",
        description: "Diverse group of fully aquatic placental marine mammals",
    },
    { label: "Otter", key: "otter", description: "A carnivorous mammal in the subfamily Lutrinae" },
    { label: "Crocodile", key: "crocodile", description: "A large semiaquatic reptile" },
];

export default function ModuleExplorer() {

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
            <div>
                <Autocomplete size="sm" label="Modules" placeholder="Search for your module">
                    {modules.map((animal) => (
                        <AutocompleteItem key={animal.key}>{animal.label}</AutocompleteItem>
                    ))}
                </Autocomplete>
            </div>
        </Panel>

    );
}