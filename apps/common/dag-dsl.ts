import { error } from "console"
import { DataType, Value } from "./types-dsl"

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

// Or with type narrowing using a type guard
export function isSingletonNode(node: DataNodeSpec): node is DataNodeSpec & { tag: "data-node-spec-singleton" } {
    return node.tag === "data-node-spec-singleton";
}

export function isProductNode(node: DataNodeSpec): node is DataNodeSpec & { tag: "data-node-spec-product" } {
    return node.tag === "data-node-spec-product";
}

export function isCoproductNode(node: DataNodeSpec): node is DataNodeSpec & { tag: "data-node-spec-coproduct" } {
    return node.tag === "data-node-spec-coproduct";
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

export type DataNode = {
    tag: "data-node-singleton"
    spec: DataNodeSpec
    data: Value
}

export type ModuleStatus 
    = { tag: "unfired" }
    | { tag: "fired" }
    | { tag: "failed", error: string }

export type EngineContext = {
    processUuid: string
    dag: DagSpec
    moduleStatus: { [uuid: string]: ModuleStatus }
    loadedData: { [uuid: string]: DataNode }
}