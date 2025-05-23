import { Handle, Position } from "@xyflow/react";
import { RenderedNodeProps } from "../graph-area-dsl";
import { Chip } from "@heroui/chip";
import { parseCValueToString } from "@/apps/common/dag-dsl";

export default function DataNodeComponent({ data }: RenderedNodeProps) {
    if (data.tag !== "data") throw new Error("Invalid node type")
    
    return (
        <div>
            <Handle type="target" position={Position.Top} isConnectable={false} />
            <div className="grid grid-cols-1 gap-1">
                <div className="node-header">{data.name}</div>
                {data.value && (
                    <div className="node-value">
                        <Chip size="sm" color="primary" variant="flat">{parseCValueToString(data.value)}</Chip>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} isConnectable={false} />
        </div>
    );
}
