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
import { Component, Info, MoveHorizontal, MoveVertical, PlayCircle } from "lucide-react";
import { CSSProperties, useMemo } from "react";
import { ToolDagRunnerView } from "../tool-dag-runner";
import { ToolModuleExplorerView } from "../tool-module-explorer";
import { ToolNodeInfoView } from "../tool-node-info";

const nodeTypes: Record<RenderedNodeType, (props: RenderedNodeProps) => JSX.Element> = {
    "data": DataNodeComponent,
    "module": ModuleNodeComponent,
}

interface GraphAreaViewProps {
    dagName: string,
}

export default function GraphAreaView({ dagName }: GraphAreaViewProps) {

    useInitGraphAreaState(dagName)
    const isClient = useIsClient()
    const theme = useConstellationTheme()
    const state = useGraphAreaStore(useShallow((state: GraphAreaState) => ({
        dag: state.dag,
        nodes: state.nodes,
        edges: state.edges,
        context: state.context,
        selectedNodeId: state.selectedNodeId,
        displayedTool: state.displayedTool,
        diplayTool: state.diplayTool,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onSelectNode: state.selectNode,
        onLayoutPress: state.onLayoutPress,
        onAddModule: state.addModuleToDag,
        onModuleDelete: state.canBeDeleted,
        onRunDagWithInputs: state.runDagWithInputs,
        onCleanEngineContext: state.cleanEngineContext,
    })))
    const toolComponentMap: ToolComponentMap = useMemo(() => ({
        "module-explorer": {
            title: "Module Explorer",
            ariaLabel: "Module Explorer",
            component: <ToolModuleExplorerView onAddModule={state.onAddModule} />,
            icon: <Component style={{ fill: 'none', maxWidth: '40px', maxHeight: '40px' } as CSSProperties} />,
        },
        "module-info": {
            title: "Module Info",
            ariaLabel: "Module Info",
            component: <ToolNodeInfoView dag={state.dag} context={state.context} nodeId={state.selectedNodeId} />,
            icon: <Info style={{ fill: 'none', maxWidth: '40px', maxHeight: '40px' } as CSSProperties} />,
        },
        "dag-runner": {
            title: "DAG Runner",
            ariaLabel: "DAG Runner",
            component: <ToolDagRunnerView dag={state.dag} onRun={state.onRunDagWithInputs} onReset={state.onCleanEngineContext} />,
            icon: <PlayCircle style={{ fill: 'none', maxWidth: '40px', maxHeight: '40px' } as CSSProperties} />,
        },
    }), [state.dag, state.context, state.selectedNodeId])

    /* Only render ReactFlow on the client to avoid hydration issues. */
    if (!isClient) return 
        <div className="border-gray-300 border-1 rounded-md" style={{ width: "99vw", height: "89vh" }}>
            Loading graph...
        </div>;

    return (
        <div id="graph-area" className="w-full h-full">
            <ReactFlow
                nodes={state.nodes}
                edges={state.edges}
                onNodesChange={state.onNodesChange}
                onEdgesChange={state.onEdgesChange}
                onNodeClick={(_, node) => state.onSelectNode(node.id)}
                nodeTypes={nodeTypes} 
                onBeforeDelete={state.onModuleDelete}
                attributionPosition="bottom-left"
                colorMode={theme}
                fitView>
                <Controls position="bottom-right">
                    <ControlButton
                        title="Vertical layout"
                        aria-label="Vertical layout"
                        onClick={() => state.onLayoutPress("TB")}>
                        <MoveVertical />
                    </ControlButton>
                    <ControlButton
                        title="Hostizonal layout"
                        aria-label="Hostizonal layout"
                        onClick={() => state.onLayoutPress("LR")}>
                        <MoveHorizontal />
                    </ControlButton>
                </Controls>
                <ToolsArea displayedTool={state.displayedTool} toolComponentMap={toolComponentMap} onToolPick={state.diplayTool} />
                <MiniMap position="bottom-left" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div >
    )
}