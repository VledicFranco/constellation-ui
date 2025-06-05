import { DagSpec, RuntimeState } from "@/apps/common/dag-dsl";
import UnselectedNodeInfo from "./components/unselected-node-info";
import NodeCardData from "@/apps/common/node-card-data";
import NodeCardModule from "@/apps/common/node-card-module";

interface ToolNodeInfoViewProps {
    dag: DagSpec
    context?: RuntimeState
    nodeId?: string
    onNodeSelect?: (nodeId: string) => void
}

export default function ToolNodeInfoView({ dag, context, nodeId, onNodeSelect }: ToolNodeInfoViewProps) {
    const dataNode = nodeId ? dag.data[nodeId] : undefined;
    const moduleNode = nodeId ? dag.modules[nodeId] : undefined;

    if (nodeId && dataNode)
        return <NodeCardData dag={dag} spec={dataNode} nodeId={nodeId} data={nodeId ? context?.data[nodeId] : undefined } />
    else if (nodeId && moduleNode)
        return <NodeCardModule dag={dag} spec={moduleNode} context={context} status={nodeId ? context?.moduleStatus[nodeId] : undefined} />
    else
        return <UnselectedNodeInfo dag={dag} context={context} onNodeSelect={onNodeSelect} />
}
