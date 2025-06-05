import * as R from 'remeda'

export type CTypeString = { tag: "CString" }

export type CTypeInt = { tag: "CInt" }

export type CTypeFloat = { tag: "CFloat" }

export type CTypeBoolean = { tag: "CBoolean" }

export type CTypeList = { tag: "CList", valuesType: CType }

export type CTypeMap = { tag: "CMap", keysType: CType, valuesType: CType }

export type CType = CTypeString | CTypeInt | CTypeFloat | CTypeBoolean | CTypeList | CTypeMap

export type CValueString = { tag: "CString", value: string }

export type CValueInt = { tag: "CInt", value: number }

export type CValueFloat = { tag: "CFloat", value: number }

export type CValueBoolean = { tag: "CBoolean", value: boolean }

export type CValueList = { tag: "CList", value: CValue[], valuesType: CType }

export type CValueMap = { tag: "CMap", value: [CValue, CValue][], keysType: CType, valuesType: CType }

export type CValue = CValueString | CValueInt | CValueFloat | CValueBoolean | CValueList | CValueMap

export const cTypeString: CTypeString = { tag: "CString" }
export const cTypeInt: CTypeInt = { tag: "CInt" }
export const cTypeFloat: CTypeFloat = { tag: "CFloat" }
export const cTypeBoolean: CTypeBoolean = { tag: "CBoolean" }
export const cTypeList = (valuesType: CType): CTypeList =>
    ({ tag: "CList", valuesType })
export const cTypeMap = (keysType: CType, valuesType: CType): CTypeMap =>
    ({ tag: "CMap", keysType, valuesType })

export function cTypeOf(value: CValue): CType {
    switch (value.tag) {
        case "CString":
            return cTypeString
        case "CInt":
            return cTypeInt
        case "CFloat":
            return cTypeFloat
        case "CBoolean":
            return cTypeBoolean
        case "CList":
            return cTypeList(value.valuesType)
        case "CMap":
            return cTypeMap(value.keysType, value.valuesType)
    }
}

export const cValueString = (value: string): CValueString => 
    ({ tag: "CString", value })
export const cValueInt = (value: number): CValueInt => 
    ({ tag: "CInt", value })
export const cValueFloat = (value: number): CValueFloat =>
    ({ tag: "CFloat", value })
export const cValueBoolean = (value: boolean): CValueBoolean =>
    ({ tag: "CBoolean", value })
export const cValueList = (value: CValue[]): CValueList => {
    const head = value[0]
    if (head) return ({ tag: "CList", value, valuesType: cTypeOf(head) })
    else throw new Error("CList cannot be empty.")
}
export const cValueListOf = (value: CValue[], cType: CType): CValueList => {
    return ({ tag: "CList", value, valuesType: cType })
}
export const cValueMap = (value: [CValue, CValue][]): CValueMap => {
    const head = value[0]
    if (head) return ({ tag: "CMap", value, keysType: cTypeOf(head[0]), valuesType: cTypeOf(head[1]) })
    else throw new Error("CMap cannot be empty.")
}
export const cValueMapOf = (value: [CValue, CValue][], keysType: CType, valuesType: CType): CValueMap => {
    return ({ tag: "CMap", value, keysType, valuesType })
}

export type DagSpec = {
    metadata: ComponentMetadata
    modules: { [uuid: string]: ModuleNodeSpec }
    data: { [uuid: string]: DataNodeSpec }
    inEdges: [string, string][] // data node -> module node
    outEdges: [string, string][] // module node -> data node
}

export type DataNodeSpec = {
    name: string
    nicknames: Record<string, string>
    cType: CType
}

export type ModuleNodeSpec<Context = any> = {
    metadata: ComponentMetadata
    consumes: Record<string, CType>
    produces: Record<string, CType>
    config: ModuleRuntimeConfig
    context?: Context
}

export type ModuleRuntimeConfig = {
    moduleTimeout: number
    inputsTimeout: number
}

export type ComponentMetadata = {
    name: string
    description: string
    tags: string[]
    minorVersion: number
    majorVersion: number
}

export type ModuleStatus<Context = any>
    = { tag: "Unfired" }
    | { tag: "Fired", latency: number, context?: Context }
    | { tag: "Timed", latency: number }
    | { tag: "Failed", error: string }

export type RuntimeState = {
    processUuid: string
    dag: DagSpec
    moduleStatus: { [uuid: string]: ModuleStatus }
    data: { [uuid: string]: CValue }
    latency: number
}

export function emptyDag(): DagSpec {
    return {
        metadata: emptyMetadata(),
        modules: {},
        data: {},
        inEdges: [],
        outEdges: []
    }
}

export function emptyMetadata(): ComponentMetadata {
    return {
        name: "empty-component",
        description: "This is an empty component.",
        tags: [],
        minorVersion: 1,
        majorVersion: 0,
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
    if (cType.tag === "CString")
        return "string"
    else if (cType.tag === "CInt")
        return "integer"
    else if (cType.tag === "CFloat")
        return "float"
    else if (cType.tag === "CBoolean")
        return "boolean"
    else if (cType.tag === "CList")
        return `list<${cTypeToString(cType.valuesType)}>`
    else 
        return `map<${cTypeToString(cType.keysType)}, ${cTypeToString(cType.valuesType)}>`
}

export function parseStringToCValue(cType: CType, value: string): CValue {
    if (cType.tag === "CString")
        return { tag: "CString", value }
    else if (cType.tag === "CInt")
        return { tag: "CInt", value: parseInt(value) }
    else if (cType.tag === "CFloat")
        return { tag: "CFloat", value: parseFloat(value) }
    else if (cType.tag === "CBoolean")
        return { tag: "CBoolean", value: value === "true" }
    else if (cType.tag === "CList") {
        const values = value.split(",").map(v => v.trim())
        return { tag: "CList", value: values.map(v => parseStringToCValue(cType.valuesType, v)), valuesType: cType.valuesType }
    }
    else 
        throw new Error(`Unsupported CType: ${cType.tag}`)
}

export function parseCValueToString(cValue: CValue): string {
    if (cValue.tag === "CString")
        return `"${cValue.value}"`
    else if (cValue.tag === "CInt")
        return cValue.value.toString()
    else if (cValue.tag === "CFloat")
        return cValue.value.toString()
    else if (cValue.tag === "CBoolean")
        return cValue.value ? "true" : "false"
    else if (cValue.tag === "CList") {
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
    if (cValue.tag === "CString")
        return cValue.value
    else if (cValue.tag === "CInt")
        return cValue.value
    else if (cValue.tag === "CFloat")
        return cValue.value
    else if (cValue.tag === "CBoolean")
        return cValue.value
    else if (cValue.tag === "CList")
        return cValue.value.map(v => cValueToJson(v))
    else if (cValue.tag === "CMap" && cValue.valuesType.tag === "CString") 
        return cValue.value.reduce((acc, [key, value]) => {
            return {...acc, [cValueToJson(key)]: cValueToJson(value)}
        }, {})
    else
        return Object.fromEntries(cValue.value.map(([key, value]) => [cValueToJson(key), cValueToJson(value)]))
}
