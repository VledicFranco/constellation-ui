import { cTypeToString, DagSpec } from "@/apps/common/dag-dsl";
import { Card, CardBody, CardHeader } from "@heroui/card";

interface UnselectedNodeInfoProps {
    dag: DagSpec
}

export default function UnselectedNodeInfo({ dag }: UnselectedNodeInfoProps) {
    return <Card>
        <CardHeader>
            <p className="text-center text-gray-500">Select a node to view its details</p>
            <p className="text-center text-gray-500">Click on a node in the graph or select it from the list</p>
        </CardHeader>
        <CardBody>
            <h3 className="mt-4">Module Nodes</h3>
            {Object.entries(dag.modules).map(([nodeId, node]) => (
                <div key={nodeId} className="flex flex-col gap-1">
                    <span className="font-semibold">{node.name}</span>
                    <span className="text-sm text-gray-500">{node.metadata.description}</span>
                </div>
            ))}
            <h3>Data Nodes</h3>
            {Object.entries(dag.data).map(([nodeId, node]) => (
                <div key={nodeId} className="flex flex-col gap-1">
                    <span className="font-semibold">{node.name}</span>
                    <span className="text-sm text-gray-500">{cTypeToString(node.cType)}</span>
                </div>
            ))}
        </CardBody>
    </Card>
}