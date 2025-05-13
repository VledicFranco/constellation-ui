import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    ControlButton,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useRef } from "react";
import { Brain, Cog, Grab } from "lucide-react";

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
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

    return (
        <div className="border-gray-300 border-1 rounded" style={{ width: '99vw', height: '89vh' }} ref={reactFlowWrapper}>
            <ReactFlow nodes={nodes} onNodesChange={onNodesChange}>
                <Controls position='top-right'>
                    <ControlButton
                        title='explore retrievers'
                        aria-label='explore retrievers'
                        onClick={() => alert('Something magical just happened. ✨')}>
                        <Grab />
                    </ControlButton>
                    <ControlButton
                        title='explore models'
                        aria-label='explore models'
                        onClick={() => alert('Something magical just happened. ✨')}>
                        <Brain />
                    </ControlButton>
                    <ControlButton
                        title='explore the algorithms'
                        aria-label='explore the algorithms'
                        onClick={() => alert('Something magical just happened. ✨')}>
                        <Cog />
                    </ControlButton>
                </Controls>
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};