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

<<<<<<< HEAD
import ModulesControls from './components/modules-controls';
import ModulesExplorer from './components/module-explorer';

import { useShallow } from 'zustand/react/shallow';
import { GraphAreaState, useGraphAreaStore } from "./graph-area-state";
=======
import { useRef } from "react";
>>>>>>> f7f192bda08a57ec87114ce1b4161ce05a61209d

// Create a proper selector that extracts nodes from the state
const selector = (state: GraphAreaState) => ({
    nodes: state.nodes || [],
    edges: state.edges || [],
});

<<<<<<< HEAD
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
=======
interface GraphAreaViewProps {
    children?: React.ReactNode
}

export default function GraphAreaView({ children }: GraphAreaViewProps) {
    const reactFlowWrapper = useRef(null);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
>>>>>>> f7f192bda08a57ec87114ce1b4161ce05a61209d

    return (
        <div className="border-gray-300 border-1 rounded-md" style={{ width: '99vw', height: '89vh' }}>
            <ReactFlow nodes={nodes} edges={edges}>
                <Controls />
<<<<<<< HEAD
                <ModulesControls position='top-right' onButtonClick={toggleModulesExplorer} />
                {showModulesExplorer && <ModulesExplorer />}
=======
                {children}
>>>>>>> f7f192bda08a57ec87114ce1b4161ce05a61209d
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};