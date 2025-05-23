import { CType, CValue, ModuleNodeSpec } from "@/apps/common/dag-dsl";
import { useGraphAreaStore } from "./graph-area-state";
import EditorBackendApi from "../../editor-backend-api";

const specToValue = (cType: CType, value: string): CValue => {
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
        return { tag: "list", value: values.map(v => specToValue(cType.valuesType, v)), valuesType: cType.valuesType }
    }
    else 
        throw new Error(`Unsupported CType: ${cType.tag}`)
}

const GraphAreaApi = {

    addModule: (module: ModuleNodeSpec) =>
        useGraphAreaStore.getState().addModuleToDag(module),

    getDagInputs: () =>
        useGraphAreaStore.getState().getDagInputs(),

    runDagWithInputs: async (inputs: Record<string, string>) => {
        const state = useGraphAreaStore.getState()
        const specs = state.getDagInputs()
        const dataNodes = Object.entries(specs).reduce((acc, [uuid, spec]) => {
            const input = inputs[uuid]
            return { ...acc, [spec.name]: specToValue(spec.cType, input) }
        }, {} as Record<string, CValue>)
        const result = await EditorBackendApi.runDag(state.dag.name, dataNodes)
        state.renderEngineContext(result)
        return result
    }
}

export default GraphAreaApi
