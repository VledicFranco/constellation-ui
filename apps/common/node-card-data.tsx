import { CType, cTypeToString, CValue, cValueToJson, DagSpec, DataNodeSpec } from "@/apps/common/dag-dsl";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Code, Divider } from "@heroui/react";
import cc from "classcat";
import { Box, PackageCheck } from "lucide-react";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

export function DataIcon({ value }: { value?: CType }) {
    if (!value) return <Box size="18" />
    else return <PackageCheck size="18" className="text-success-500" />
}

export interface NodeCardDataProps {
    dag: DagSpec
    nodeId: string
    spec: DataNodeSpec
    data?: CValue
    isSelected?: boolean
}

export default function NodeCardData({ dag, nodeId, spec, data, isSelected }: NodeCardDataProps) {
    const border = data ? "border-success-100" : "border-primary-200"
    const borderType = isSelected ? "outline-double outline-3 outline-offset-2" : "outline-solid"
    return <Card className={cc([border, borderType, "border-1"])}>
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
