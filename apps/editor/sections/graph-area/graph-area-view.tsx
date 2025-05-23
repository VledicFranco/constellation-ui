import Dagre from "@dagrejs/dagre";
import { useEffect, useState, useCallback, CSSProperties } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Handle,
    Position,
    Panel,
    ControlButton,
    NodeToolbar,
    Edge,
} from "@xyflow/react";
import { MoveHorizontal, MoveVertical, Info } from "lucide-react";
import "@xyflow/react/dist/style.css";
import "./graph-area-styles.css";

import { useShallow } from "zustand/react/shallow";
import { GraphAreaState, useGraphAreaStore, useInitGraphAreaState } from "./graph-area-state";
import { Chip } from "@heroui/react";
import { ModuleStatus, parseCValueToString } from "@/apps/common/dag-dsl"
import { RenderedNode, RenderedNodeProps, RenderedNodeType } from "./graph-area-dsl";

const getLayoutedElements = (nodes: RenderedNode[], edges: Edge[], options: { direction: string }) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        }),
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

// Create a proper selector that extracts nodes from the state
const selector = (state: GraphAreaState) => ({
    nodes: state.nodes || [],
    edges: state.edges || [],
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    attemptModuleDeletion: state.canBeDeleted,
    mergeDataNodes: state.mergeDataNodes,
});

interface GraphAreaViewProps {
    children?: React.ReactNode
}

// Update node components to use NodeProps type for better type safety
function DagDataNode({ data }: RenderedNodeProps) {
    if (data.tag !== "data") throw new Error("Invalid node type")
    
    return (
        <div>
            <Handle type="target" position={Position.Top} isConnectable={true} />
            <div className="grid grid-cols-1 gap-1">
                <div className="node-header">{data.name}</div>
                {data.value && (
                    <div className="node-value">
                        <Chip size="sm" color="primary" variant="flat">{parseCValueToString(data.value)}</Chip>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={true} />
        </div>
    );
}

function DagModuleNode({ data }: RenderedNodeProps) {
    if (data.tag !== "module") throw new Error("Invalid node type")

    const moduleTagChipClass = (status: ModuleStatus) => {
        switch (status.tag) {
            case "fired":
                return "success";
            case "failed":
                return "danger";
            case "timed":
                return "warning";
            case "unfired":
                return "warning";
            default:
                return "default";
        }
    }

    const message = (status: ModuleStatus) => {
        switch (status.tag) {
            case "fired":
                return "fired: " + status.latency + "ms";
            case "failed":
                return "error: " + status.error;
            case "timed":
                return "timed: " + status.latency + "ms";
            case "unfired":
                return "unfired";
            default:
                return "default";
        }
    }

    return <>
        <NodeToolbar
            className="border-gray-300 border-1 rounded-sm shadow-md"
            isVisible={false}
            position={Position.Right}
        >
            <button onClick={() => {
                // TODO: open module explorer
            }}>
                <Info style={{ fill: "none", maxWidth: "15px", maxHeight: "15px" } as CSSProperties} />
            </button>
        </NodeToolbar >
        <div>
            <Handle type="target" position={Position.Top} isConnectable={true} />
            <div className="grid grid-cols-1 gap-1">
                <div className="node-header">{data.name}</div>
                {data.status && (
                    <div className="node-value">
                        <Chip size="sm" variant="flat" color={moduleTagChipClass(data.status)}>{message(data.status)}</Chip>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={true} />
        </div >
    </>
}

const nodeTypes: Record<RenderedNodeType, (props: RenderedNodeProps) => JSX.Element> = {
    "data": DagDataNode,
    "module": DagModuleNode,
}

interface GraphAreaViewProps {
    dagName: string,
    children?: React.ReactNode
}

export default function GraphAreaView({ children, dagName }: GraphAreaViewProps) {

    useInitGraphAreaState(dagName);

    // The issue might be here - make sure nodeTypes keys match the node type in your store

    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges, attemptModuleDeletion, mergeDataNodes } = useGraphAreaStore(useShallow(selector));

    // Add client-side-only rendering to prevent hydration mismatch
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, { direction });
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);
        },
        [nodes, edges],
    );

    // Only render ReactFlow on the client to avoid hydration issues
    if (!isClient) {
        return <div className="border-gray-300 border-1 rounded-md" style={{ width: "99vw", height: "89vh" }}>
            Loading graph...
        </div>;
    }

    return (
        <div id="graph-area" className="border-gray-300 border-1 rounded-md" style={{ width: "99vw", height: "89vh" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes} 
                onBeforeDelete={attemptModuleDeletion}
                attributionPosition="bottom-left"
                fitView>
                <Controls />
                {children}
                <MiniMap />
                <Panel id="explorer-toggle-button"
                    className={"vertical border-gray-300 border-1 rounded-sm w-60"}
                    position={"top-left"}
                    aria-label="Module Explorer toggle button">
                    <ControlButton
                        title="vertical layout"
                        aria-label="vertical layout"
                        onClick={() => onLayout("LR")}
                        style={{ width: "40px", height: "40px" } as CSSProperties}>
                        <MoveHorizontal style={{ fill: "none", maxWidth: "20px", maxHeight: "20px" } as CSSProperties} />
                    </ControlButton>
                    <ControlButton
                        title="vertical layout"
                        aria-label="vertical layout"
                        onClick={() => onLayout("TB")}
                        style={{ width: "40px", height: "40px" } as CSSProperties}>
                        <MoveVertical style={{ fill: "none", maxWidth: "20px", maxHeight: "20px" } as CSSProperties} />
                    </ControlButton>
                </Panel>
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div >
    );
};