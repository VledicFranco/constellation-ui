import { DataNode, DataNodeSpec, ModuleNodeSpec } from "@/apps/common/dag-dsl";
import { useGraphAreaStore } from "./graph-area-state";
import EditorBackendApi from "../../editor-backend-api";
import { buildValue } from "@/apps/common/types-dsl";

const specToValue = (spec: DataNodeSpec, value: string): DataNode => {
    if (spec.tag === "data-node-spec-singleton") {
        return {
            tag: "data-node-singleton",
            spec: spec,
            data: buildValue(value, spec.dtype)
        }
    } else 
        throw new Error(`Unsupported data node spec: ${spec.tag}`);
}

const GraphAreaApi = {

    addModule: (module: ModuleNodeSpec) =>
        useGraphAreaStore.getState().addModuleToDag(module),

    getDagInputs: () =>
        useGraphAreaStore.getState().getDagInputs(),

    runDagWithInputs: async (inputs: Record<string, string>) => {
        const state = useGraphAreaStore.getState()
        const specs = state.getDagInputs()
        const dataNodes = Object.entries(specs).map(([uuid, spec]) => {
            const input = inputs[uuid]
            return specToValue(spec, input)
        })
        const result = await EditorBackendApi.runDag(state.dag.name, dataNodes)
        state.renderEngineContext(result)
        return result
    }
}

export default GraphAreaApi
