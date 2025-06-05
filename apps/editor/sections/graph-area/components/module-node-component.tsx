import NodeCardModule from "@/apps/common/node-card-module";
import { Handle, Position } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { RenderedNodeProps } from "../graph-area-dsl";
import { useGraphAreaStore } from "../graph-area-state";

export default function ModuleNodeComponent({ id, data }: RenderedNodeProps) {
    if (data.tag !== "module") throw new Error("Invalid node type")

    const handlePositionTarget = data.preferredLayout === "TB" ? Position.Top : Position.Left
    const handlePositionSource = data.preferredLayout === "TB" ? Position.Bottom : Position.Right
    const isSelected = useGraphAreaStore(useShallow((state) => state.selectedNodeId === id))
    const cardProps = { ...data.cardProps, isSelected }
   return <div>
        <Handle type="target" position={handlePositionTarget} isConnectable={false} />
        <NodeCardModule {...cardProps} />
        <Handle type="source" position={handlePositionSource} isConnectable={false} />
   </div>
}
