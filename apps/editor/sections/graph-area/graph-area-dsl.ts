import { CValue, DataNodeSpec, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { Node, NodeProps } from "@xyflow/react"

export type DataNodePayload = DataNodeSpec & {
    tag: "data"
    value?: CValue
}

export type ModuleNodePayload = ModuleNodeSpec & {
    tag: "module"
    status?: ModuleStatus
}

export type RenderedNodeType = "data" | "module"

export type RenderedNode = Node<DataNodePayload | ModuleNodePayload, RenderedNodeType>

export type RenderedNodeProps = NodeProps<RenderedNode>
