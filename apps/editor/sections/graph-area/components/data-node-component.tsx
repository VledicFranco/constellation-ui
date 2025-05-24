import { Handle, Position } from "@xyflow/react";
import { RenderedNodeProps } from "../graph-area-dsl";
import { Chip } from "@heroui/chip";
import { parseCValueToString } from "@/apps/common/dag-dsl";

export default function DataNodeComponent({ id, data }: RenderedNodeProps) {
    if (data.tag !== "data") throw new Error("Invalid node type")
    const handlePositionTarget = data.preferredLayout === "TB" ? Position.Top : Position.Left
    const handlePositionSource = data.preferredLayout === "TB" ? Position.Bottom : Position.Right
    return (
        <div>
            <Handle type="target" position={handlePositionTarget} isConnectable={false} />
            <div className="grid grid-cols-1 gap-1">
                <div className="node-header">{data.name}</div>
                <div>{id}</div>
                {data.value && (
                    <div className="node-value">
                        <Chip size="sm" color="primary" variant="flat">{parseCValueToString(data.value)}</Chip>
                    </div>
                )}
            </div>
            <Handle type="source" position={handlePositionSource} isConnectable={false} />
        </div>
    );
}
