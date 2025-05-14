import { useMemo, useEffect, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Handle,
    Position,
    NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// Import our custom styles
import './graph-area-styles.css';

import { useShallow } from 'zustand/react/shallow';
import { GraphAreaState, useGraphAreaStore } from "./graph-area-state";

// Create a proper selector that extracts nodes from the state
const selector = (state: GraphAreaState) => ({
    nodes: state.nodes || [],
    edges: state.edges || [],
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
});

interface GraphAreaViewProps {
    children?: React.ReactNode
}

// Update node components to use NodeProps type for better type safety
function DagDataNode({ data, id }: NodeProps) {
    return (
        <div>
            <Handle type="target" position={Position.Top} isConnectable={true} />
            <div className="node-header">{data.label}</div>
            <Handle type="source" position={Position.Bottom} isConnectable={true} />
        </div>
    );
}

function DagModuleNode({ data, id }: NodeProps) {
    return (
        <div>
            <Handle type="target" position={Position.Top} isConnectable={true} />
            <div className="node-header">{data.label}</div>
            <Handle type="source" position={Position.Bottom} isConnectable={true} />
        </div>
    );
}

export default function GraphAreaView({ children }: GraphAreaViewProps) {

    // The issue might be here - make sure nodeTypes keys match the node type in your store
    const nodeTypes = useMemo(() => ({
        dagData: DagDataNode,
        dagModule: DagModuleNode,
    }), []);

    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useGraphAreaStore(useShallow(selector));

    // Add client-side-only rendering to prevent hydration mismatch
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Only render ReactFlow on the client to avoid hydration issues
    if (!isClient) {
        return <div className="border-gray-300 border-1 rounded-md" style={{ width: '99vw', height: '89vh' }}>
            Loading graph...
        </div>;
    }

    return (
        <div id="graph-area" className="border-gray-300 border-1 rounded-md" style={{ width: '99vw', height: '89vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes} /* Fixed variable name from noteTypes to nodeTypes */
                attributionPosition="bottom-left"
                fitView>
                <Controls />
                {children}
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div >
    );
};