import { cTypeToString, DagSpec, RuntimeState } from "@/apps/common/dag-dsl";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { DataIcon } from "@/apps/common/node-card-data";
import { ModuleIcon } from "@/apps/common/node-card-module";

interface UnselectedNodeInfoProps {
    dag: DagSpec
    context?: RuntimeState
    onNodeSelect?: (nodeId: string) => void
}

export default function UnselectedNodeInfo({ dag, context, onNodeSelect }: UnselectedNodeInfoProps) {
    return <Card>
        <CardHeader>
            <p className="text-center text-gray-500">Click on a node in the graph or select it from the list</p>
        </CardHeader>
        <CardBody>
            <p className="text-sm text-default-500 mb-1">Modules</p>
            <div className="flex flex-col gap-2 items-start">
                {Object.entries(dag.modules).map(([nodeId, node]) => (
                    <Button className="border-secondary-300" variant="bordered" radius="sm" key={nodeId} onPress={() => onNodeSelect?.(nodeId)}>
                        <ModuleIcon status={context?.moduleStatus[nodeId]} />
                        <div className="flex flex-row gap-1">
                            <p className="text-lg font-bold">{node.metadata.name}</p>
                            <small className="block text-default-500">v{node.metadata.majorVersion}.{node.metadata.minorVersion}</small>
                        </div>
                    </Button>
                ))}
            </div>
            <p className="text-sm text-default-500 mt-3 mb-1">Data</p>
            <div className="flex flex-col gap-2 items-start">
                {Object.entries(dag.data).map(([nodeId, node]) => (
                    <Button className="border-primary-200" variant="bordered" radius="sm" key={nodeId} onPress={() => onNodeSelect?.(nodeId)}>
                        <DataIcon value={context?.data[nodeId]} />
                        <p className="text-lg font-bold text-default-600 pl-1">{node.name}</p>
                        <p className="text-lg text-default-500 font-mono">:{cTypeToString(node.cType)}</p>
                    </Button>
                ))}
            </div>
        </CardBody>
    </Card>
}