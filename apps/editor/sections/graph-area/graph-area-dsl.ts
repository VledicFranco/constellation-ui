import { CValue, DataNodeSpec, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { Node, NodeProps } from "@xyflow/react"

export type DataNodePayload = DataNodeSpec & CommonPayload & {
    tag: "data"
    value?: CValue
}

export type ModuleNodePayload = ModuleNodeSpec & CommonPayload & {
    tag: "module"
    status?: ModuleStatus
}

export type CommonPayload = {
    preferredLayout: LayoutDirection 
}

export type RenderedNodeType = "data" | "module"

export type RenderedNode = Node<DataNodePayload | ModuleNodePayload, RenderedNodeType>

export type RenderedNodeProps = NodeProps<RenderedNode>

export type LayoutDirection = "TB" | "LR"
