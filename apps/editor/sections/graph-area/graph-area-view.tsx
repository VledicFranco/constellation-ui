import {
    Node,
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDisclosure } from '@heroui/react';

import ModulesControls from './components/modules-controls';
import ModulesExplorer from './components/module-explorer';

import { useShallow } from 'zustand/react/shallow';
import { GraphAreaState, useGraphAreaStore } from "./graph-area-state";

// Create a proper selector that extracts nodes from the state
const selector = (state: GraphAreaState) => ({
    nodes: state.nodes || [],
    edges: state.edges || [],
});

export default function GraphAreaView() {
    const { isOpen: showModulesExplorer,
        onOpen: openModulesExplorer,
        onClose: closeModulesExplorer } = useDisclosure();

    // Define the toggle function correctly
    const toggleModulesExplorer = () => {
        if (showModulesExplorer) {
            closeModulesExplorer();
        } else {
            openModulesExplorer();
        }
    };

    // Use the selector to get nodes from the store
    const { nodes, edges } = useGraphAreaStore(useShallow(selector));

    return (
        <div className="border-gray-300 border-1 rounded-md" style={{ width: '99vw', height: '89vh' }}>
            <ReactFlow nodes={nodes} edges={edges}>
                <Controls />
                <ModulesControls position='top-right' onButtonClick={toggleModulesExplorer} />
                {showModulesExplorer && <ModulesExplorer />}
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};