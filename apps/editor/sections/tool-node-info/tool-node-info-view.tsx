import { DagSpec, EngineContext } from "@/apps/common/dag-dsl";
import DataNodeInfo from "./components/data-node-info";
import ModuleNodeInfo from "./components/module-node-info";
import UnselectedNodeInfo from "./components/unselected-node-info";

interface ToolNodeInfoViewProps {
    dag: DagSpec
    context?: EngineContext
    nodeId?: string
    onNodeSelect?: (nodeId: string) => void
}

export default function ToolNodeInfoView({ dag, context, nodeId, onNodeSelect }: ToolNodeInfoViewProps) {
    const dataNode = nodeId ? dag.data[nodeId] : undefined;
    const moduleNode = nodeId ? dag.modules[nodeId] : undefined;

    if (nodeId && dataNode)
        return <DataNodeInfo dag={dag} spec={dataNode} nodeId={nodeId} data={nodeId ? context?.loadedData[nodeId] : undefined } />
    else if (nodeId && moduleNode)
        return <ModuleNodeInfo dag={dag} spec={moduleNode} context={context} status={nodeId ? context?.moduleStatus[nodeId] : undefined} />
    else
        return <UnselectedNodeInfo dag={dag} context={context} onNodeSelect={onNodeSelect} />
}