import { CType, cTypeToString } from "@/apps/common/dag-dsl";
import { Card, CardBody } from "@heroui/card";
import { Handle, Position } from "@xyflow/react";
import cc from "classcat";
import { Box, PackageCheck } from "lucide-react";
import { RenderedNodeProps } from "../graph-area-dsl";

function DataIcon({ value }: { value?: CType }) {
    if (!value) return <Box size="12" />
    else return <PackageCheck size="12" className="text-success-500" />
}

export default function DataNodeComponent({ id, data }: RenderedNodeProps) {
    if (data.tag !== "data") throw new Error("Invalid node type")
    const handlePositionTarget = data.preferredLayout === "TB" ? Position.Top : Position.Left
    const handlePositionSource = data.preferredLayout === "TB" ? Position.Bottom : Position.Right
    const border = data.value ? "border-success-100" : "border-default-100";
    return <div>
        <Card radius="sm" className={cc([border, "border-1"])}>
            <CardBody className="px-2 py-1 flex-row items-center">
                <Handle type="target" position={handlePositionTarget} isConnectable={false} />
                <DataIcon value={data.value} />
                <p className="text-tiny font-bold text-default-600 pl-1">{data.name}</p>
                <small className="text-default-500 font-mono">:{cTypeToString(data.cType)}</small>
                <Handle type="source" position={handlePositionSource} isConnectable={false} />
            </CardBody>
        </Card>
    </div>
}
