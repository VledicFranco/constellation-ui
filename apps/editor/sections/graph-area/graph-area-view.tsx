import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useShallow } from 'zustand/react/shallow';
import { GraphAreaState, useGraphAreaStore } from "./graph-area-state";

// Create a proper selector that extracts nodes from the state
const selector = (state: GraphAreaState) => ({
    nodes: state.nodes || [],
    edges: state.edges || [],
});


interface GraphAreaViewProps {
    children?: React.ReactNode
}

export default function GraphAreaView({ children }: GraphAreaViewProps) {

    const { nodes, edges } = useGraphAreaStore(useShallow(selector));

    return (
        <div className="border-gray-300 border-1 rounded-md" style={{ width: '99vw', height: '89vh' }}>
            <ReactFlow nodes={nodes} edges={edges}>
                <Controls />
                {children}
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow >
        </div >
    );
};