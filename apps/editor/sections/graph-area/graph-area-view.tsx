import {
    Background,
    BackgroundVariant,
    ControlButton,
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
import ToolsArea from "./components/tools-area";
import { RenderedNodeProps, RenderedNodeType, ToolComponentMap } from "./graph-area-dsl";
import { GraphAreaState, useGraphAreaStore, useInitGraphAreaState } from "./graph-area-state";
import { MoveHorizontal, MoveVertical } from "lucide-react";

const nodeTypes: Record<RenderedNodeType, (props: RenderedNodeProps) => JSX.Element> = {
    "data": DataNodeComponent,
    "module": ModuleNodeComponent,
}

interface GraphAreaViewProps {
    dagName: string,
    toolComponentMap: ToolComponentMap
}

export default function GraphAreaView({ dagName, toolComponentMap }: GraphAreaViewProps) {

    useInitGraphAreaState(dagName)
    const isClient = useIsClient()
    const theme = useConstellationTheme()
    const g = useGraphAreaStore(useShallow((state: GraphAreaState) => ({
        nodes: state.nodes,
        edges: state.edges,
        displayedTool: state.displayedTool,
        diplayTool: state.diplayTool,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onLayoutPress: state.onLayoutPress,
        attemptModuleDeletion: state.canBeDeleted,
    })))

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
                <Controls position="bottom-right">
                    <ControlButton
                        title="Vertical layout"
                        aria-label="Vertical layout"
                        onClick={() => g.onLayoutPress("TB")}>
                        <MoveVertical />
                    </ControlButton>
                    <ControlButton
                        title="Hostizonal layout"
                        aria-label="Hostizonal layout"
                        onClick={() => g.onLayoutPress("LR")}>
                        <MoveHorizontal />
                    </ControlButton>
                </Controls>
                <ToolsArea displayedTool={g.displayedTool} toolComponentMap={toolComponentMap} onToolPick={g.diplayTool} />
                <MiniMap position="bottom-left" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div >
    )
}