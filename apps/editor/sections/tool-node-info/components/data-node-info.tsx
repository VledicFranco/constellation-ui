import { CType, cTypeToString, CValue, cValueToJson, DagSpec, DataNodeSpec, parseCValueToString } from "@/apps/common/dag-dsl";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Code, Divider } from "@heroui/react";
import { Box, PackageCheck } from "lucide-react";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

export function DataIcon({ value }: { value?: CType }) {
    if (!value) return <Box size="18" />
    else return <PackageCheck size="18" className="text-success-500" />
}

interface ToolNodeInfoViewProps {
    dag: DagSpec
    nodeId: string
    spec: DataNodeSpec
    data?: CValue
}

export default function ToolNodeInfoView({ dag, nodeId, spec, data }: ToolNodeInfoViewProps) {
    return <Card>
        <CardHeader>
            <DataIcon value={data} />
            <p className="text-lg font-bold text-default-600 pl-2">{spec.name}</p>
            <p className="text-lg text-default-500 font-mono">:{cTypeToString(spec.cType)}</p>
        </CardHeader>
        <Divider />
        <CardBody>
            { data && <>
                <p className="text-sm text-default-500 mb-1">Value</p>
                <JsonView src={cValueToJson(data)} />
            </> }
            <p className="text-sm text-default-500 mt-3">Nicknames</p>
            {Object.entries(spec.nicknames).map(([moduleUuid, nickname]) => {
                const module = dag.modules[moduleUuid]
                const isConsumes = dag.inEdges.filter(([data, target]) => data === nodeId && target === moduleUuid).length > 0
                const arrow = isConsumes ? "<-" : "->"
                return <Code className="mt-1">{`${module?.metadata.name} ${arrow} (${nickname})`}</Code>
            })}
        </CardBody>
    </Card>
}