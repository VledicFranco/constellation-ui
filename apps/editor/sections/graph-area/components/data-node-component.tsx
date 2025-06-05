import NodeCardData from "@/apps/common/node-card-data";
import { Handle, Position } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { RenderedNodeProps } from "../graph-area-dsl";
import { useGraphAreaStore } from "../graph-area-state";

export default function DataNodeComponent({ id, data }: RenderedNodeProps) {
    if (data.tag !== "data") throw new Error("Invalid node type")
    const handlePositionTarget = data.preferredLayout === "TB" ? Position.Top : Position.Left
    const handlePositionSource = data.preferredLayout === "TB" ? Position.Bottom : Position.Right
    const isSelected = useGraphAreaStore(useShallow((state) => state.selectedNodeId === id))
    const cardProps = { ...data.cardProps, isSelected}
    return <div>
        <Handle type="target" position={handlePositionTarget} isConnectable={false} />
        <NodeCardData {...cardProps} />
        <Handle type="source" position={handlePositionSource} isConnectable={false} />
    </div>
}
