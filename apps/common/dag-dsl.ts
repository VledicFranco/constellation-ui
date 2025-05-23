import * as R from 'remeda'

export type CTypeString = { tag: "string" }

export type CTypeInt = { tag: "integer" }

export type CTypeFloat = { tag: "float" }

export type CTypeBoolean = { tag: "boolean" }

export type CTypeList = { tag: "list", valuesType: CType }

export type CTypeMap = { tag: "map", keysType: CType, valuesType: CType }

export type CType = CTypeString | CTypeInt | CTypeFloat | CTypeBoolean | CTypeList | CTypeMap

export type CValueString = { tag: "string", value: string }

export type CValueInt = { tag: "integer", value: number }

export type CValueFloat = { tag: "float", value: number }

export type CValueBoolean = { tag: "boolean", value: boolean }

export type CValueList = { tag: "list", value: CValue[], valuesType: CType }

export type CValueMap = { tag: "map", value: [CValue, CValue][], keysType: CType, valuesType: CType }

export type CValue = CValueString | CValueInt | CValueFloat | CValueBoolean | CValueList | CValueMap

export type DataNodeSpec = {
    name: string
    nicknames: Record<string, string>
    cType: CType
}

export type ModuleMetadata = {
    description: string
    tags: string[]
    version: string
}

export const emptyModuleMetadata: ModuleMetadata = {
    description: "",
    tags: [],
    version: "0.0.0"
}

export type ModuleNodeSpec = {
    name: string
    metadata: ModuleMetadata
    produces: Record<string, CType>
    consumes: Record<string, CType>
}

export type DagSpec = {
    name: string
    modules: { [uuid: string]: ModuleNodeSpec }
    data: { [uuid: string]: DataNodeSpec }
    inEdges: [string, string][] // data node -> module node
    outEdges: [string, string][] // module node -> data node
}

export const emptyDag: DagSpec = {
    name: "empty-dag",
    modules: {},
    data: {},
    inEdges: [],
    outEdges: []
}

export type ModuleStatus
    = { tag: "unfired" }
    | { tag: "fired", latency: number }
    | { tag: "timed", latency: number }
    | { tag: "failed", error: string }

export type EngineContext = {
    processUuid: string
    dag: DagSpec
    moduleStatus: { [uuid: string]: ModuleStatus }
    loadedData: { [uuid: string]: CValue }
    latency: number
}

export function getDagInputs(dag: DagSpec) {
    const inIds = R.difference(Object.keys(dag.data), R.keys(dag.inEdges))
    return Object.entries(dag.data).filter(([id, spec]) => inIds.includes(id))
}
