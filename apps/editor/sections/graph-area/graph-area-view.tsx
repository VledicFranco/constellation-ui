import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useRef } from "react";
import ModulesControls from './components/modules-controls';
import ModulesExplorer from './components/module-explorer';

import { useDisclosure } from '@heroui/react';

const initialNodes = [
    {
        id: '0',
        type: 'input',
        data: { label: 'Node' },
        position: { x: 0, y: 50 },
    },
];

export default function GraphAreaView() {
    const reactFlowWrapper = useRef(null);
    const { isOpen: showModulesExplorer,
        onOpen: openModulesExplorer,
        onClose: closeModulesExplorer } = useDisclosure();


    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    const f = () => { showModulesExplorer ? closeModulesExplorer() : openModulesExplorer(); }

    return (
        <div className="border-gray-300 border-1 rounded-md" style={{ width: '99vw', height: '89vh' }} ref={reactFlowWrapper}>
            <ReactFlow nodes={nodes} onNodesChange={onNodesChange}>
                <Controls />
                <ModulesControls position='top-right' onButtonClick={f} />
                {showModulesExplorer && <ModulesExplorer />}
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};