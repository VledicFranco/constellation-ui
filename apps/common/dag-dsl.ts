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

export const cTypeString: CTypeString = { tag: "string" }
export const cTypeInt: CTypeInt = { tag: "integer" }
export const cTypeFloat: CTypeFloat = { tag: "float" }
export const cTypeBoolean: CTypeBoolean = { tag: "boolean" }
export const cTypeList = (valuesType: CType): CTypeList =>
    ({ tag: "list", valuesType })
export const cTypeMap = (keysType: CType, valuesType: CType): CTypeMap =>
    ({ tag: "map", keysType, valuesType })

export function cTypeOf(value: CValue): CType {
    switch (value.tag) {
        case "string":
            return cTypeString
        case "integer":
            return cTypeInt
        case "float":
            return cTypeFloat
        case "boolean":
            return cTypeBoolean
        case "list":
            return cTypeList(value.valuesType)
        case "map":
            return cTypeMap(value.keysType, value.valuesType)
    }
}

export const cValueString = (value: string): CValueString => 
    ({ tag: "string", value })
export const cValueInt = (value: number): CValueInt => 
    ({ tag: "integer", value })
export const cValueFloat = (value: number): CValueFloat =>
    ({ tag: "float", value })
export const cValueBoolean = (value: boolean): CValueBoolean =>
    ({ tag: "boolean", value })
export const cValueList = (value: CValue[]): CValueList => {
    const head = value[0]
    if (head) return ({ tag: "list", value, valuesType: cTypeOf(head) })
    else throw new Error("CList cannot be empty.")
}
export const cValueListOf = (value: CValue[], cType: CType): CValueList => {
    return ({ tag: "list", value, valuesType: cType })
}
export const cValueMap = (value: [CValue, CValue][]): CValueMap => {
    const head = value[0]
    if (head) return ({ tag: "map", value, keysType: cTypeOf(head[0]), valuesType: cTypeOf(head[1]) })
    else throw new Error("CMap cannot be empty.")
}
export const cValueMapOf = (value: [CValue, CValue][], keysType: CType, valuesType: CType): CValueMap => {
    return ({ tag: "map", value, keysType, valuesType })
}

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

export function emptyDag(): DagSpec {
    return {
        name: "empty-dag",
        modules: {},
        data: {},
        inEdges: [],
        outEdges: []
    }
}

export function getDagInputs(dag: DagSpec): [string, DataNodeSpec][] {
    const dataInputNames = R.pipe(dag.inEdges,
        R.map(([source, _]) => source),
        R.unique(),
        R.filter((source) => !dag.outEdges.some(([_, target]) => target === source))
    )
    const filteredInputs = R.filter(Object.entries(dag.data), ([uuid, _]) => dataInputNames.includes(uuid))
    return filteredInputs
}

export function cTypeToString(cType: CType): string {
    if (cType.tag === "string")
        return "string"
    else if (cType.tag === "integer")
        return "integer"
    else if (cType.tag === "float")
        return "float"
    else if (cType.tag === "boolean")
        return "boolean"
    else if (cType.tag === "list")
        return `list<${cTypeToString(cType.valuesType)}>`
    else 
        return `map<${cTypeToString(cType.keysType)}, ${cTypeToString(cType.valuesType)}>`
}

export function parseStringToCValue(cType: CType, value: string): CValue {
    if (cType.tag === "string")
        return { tag: "string", value }
    else if (cType.tag === "integer")
        return { tag: "integer", value: parseInt(value) }
    else if (cType.tag === "float")
        return { tag: "float", value: parseFloat(value) }
    else if (cType.tag === "boolean")
        return { tag: "boolean", value: value === "true" }
    else if (cType.tag === "list") {
        const values = value.split(",").map(v => v.trim())
        return { tag: "list", value: values.map(v => parseStringToCValue(cType.valuesType, v)), valuesType: cType.valuesType }
    }
    else 
        throw new Error(`Unsupported CType: ${cType.tag}`)
}

export function parseCValueToString(cValue: CValue): string {
    if (cValue.tag === "string")
        return `"${cValue.value}"`
    else if (cValue.tag === "integer")
        return cValue.value.toString()
    else if (cValue.tag === "float")
        return cValue.value.toString()
    else if (cValue.tag === "boolean")
        return cValue.value ? "true" : "false"
    else if (cValue.tag === "list") {
        return "[" + cValue.value.map(v => {
            const internal = parseCValueToString(v)
            return `  ${internal}`
        }).join(",\n") + "]"
    }
    else {
        return cValue.value.map(([key, value]) => `${parseCValueToString(key)}: ${parseCValueToString(value)}`).join(", ")
    }
}

export function cValueToJson(cValue: CValue): any {
    if (cValue.tag === "string")
        return cValue.value
    else if (cValue.tag === "integer")
        return cValue.value
    else if (cValue.tag === "float")
        return cValue.value
    else if (cValue.tag === "boolean")
        return cValue.value
    else if (cValue.tag === "list")
        return cValue.value.map(v => cValueToJson(v))
    else if (cValue.tag === "map" && cValue.valuesType.tag === "string") 
        return cValue.value.reduce((acc, [key, value]) => {
            return {...acc, [cValueToJson(key)]: cValueToJson(value)}
        }, {})
    else
        return Object.fromEntries(cValue.value.map(([key, value]) => [cValueToJson(key), cValueToJson(value)]))
}

export function emptyModuleMetadata(): ModuleMetadata {
    return {
        description: "",
        tags: [],
        version: "0.0.0"
    }
}
