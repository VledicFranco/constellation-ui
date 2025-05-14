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

export type ModuleNodeSpec = {
    tag: "module-node-spec"
    name: string
    in: DataNodeSpec[]
    out: DataNodeSpec[]
}

export type DagSpec = {
    tag: "dag-spec"
    name: string
    modules: { [uuid: string]: ModuleNodeSpec }
    data: { [uuid: string]: DataNodeSpec }
    inEdges: [string, string][] // data node -> module node
    outEdges: [string, string][] // module node -> data node
}
