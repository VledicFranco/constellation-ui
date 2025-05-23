import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./graph-area-styles.css";

import { useConstellationTheme, useIsClient } from "@/apps/common/common-hooks";
import { useShallow } from "zustand/react/shallow";
import DataNodeComponent from "./components/data-node-component";
import ModuleNodeComponent from "./components/module-node-component";
import { RenderedNodeProps, RenderedNodeType } from "./graph-area-dsl";
import { GraphAreaState, useGraphAreaStore, useInitGraphAreaState } from "./graph-area-state";
import LayoutPanel from "./components/layout-panel";

// Create a proper selector that extracts nodes from the state
const selector = (state: GraphAreaState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onLayoutPress: state.onLayoutPress,
    attemptModuleDeletion: state.canBeDeleted,
});

const nodeTypes: Record<RenderedNodeType, (props: RenderedNodeProps) => JSX.Element> = {
    "data": DataNodeComponent,
    "module": ModuleNodeComponent,
}

interface GraphAreaViewProps {
    dagName: string,
    children?: React.ReactNode
}

export default function GraphAreaView({ children, dagName }: GraphAreaViewProps) {

    useInitGraphAreaState(dagName);
    const g = useGraphAreaStore(useShallow(selector));
    const theme = useConstellationTheme();
    const isClient = useIsClient();

    /* Only render ReactFlow on the client to avoid hydration issues. */
    if (!isClient) return 
        <div className="border-gray-300 border-1 rounded-md" style={{ width: "99vw", height: "89vh" }}>
            Loading graph...
        </div>;

    return (
        <div id="graph-area" className="w-full h-full">
            <ReactFlow
                nodes={g.nodes}
                edges={g.edges}
                onNodesChange={g.onNodesChange}
                onEdgesChange={g.onEdgesChange}
                nodeTypes={nodeTypes} 
                onBeforeDelete={g.attemptModuleDeletion}
                attributionPosition="bottom-left"
                colorMode={theme}
                fitView>
                <Controls />
                {children}
                <LayoutPanel onLayoutPress={g.onLayoutPress} />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div >
    )
}