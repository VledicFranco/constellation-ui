import { DataType } from "./types-dsl"

export type DataNodeSpec 
    = {
        tag: "data-node-spec-singleton"
        name: string
        dtype: DataType
    }
    | {
        tag: "data-node-spec-product"
        name: string
        dtype: { [key: string]: DataType }
    }
    | {
        tag: "data-node-spec-coproduct"
        name: string
        dtype: { [key: string]: DataType }
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
    //tag: "module-node-spec"
    name: string
    produces: DataNodeSpec[]
    consumes: DataNodeSpec[]
    metadata: ModuleMetadata
}

export type DagSpec = {
    //tag: "dag-spec"
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