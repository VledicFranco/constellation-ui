import { CValue, DataNodeSpec, EngineContext, ModuleNodeSpec, parseStringToCValue } from "@/apps/common/dag-dsl";
import { useGraphAreaStore } from "./graph-area-state";
import EditorBackendApi from "../../editor-backend-api";

const GraphAreaApi = {

    async addModule(module: ModuleNodeSpec): Promise<void> {
        useGraphAreaStore.getState().addModuleToDag(module)
    },

    getDagInputs(): Record<string, DataNodeSpec> {
        return useGraphAreaStore.getState().getDagInputs()
    },

    async runDagWithInputs(inputs: Record<string, string>): Promise<EngineContext> {
        const state = useGraphAreaStore.getState()
        const specs = state.getDagInputs()
        const dataNodes = Object.entries(specs).reduce((acc, [uuid, spec]) => {
            const input = inputs[uuid]
            return { ...acc, [spec.name]: parseStringToCValue(spec.cType, input) }
        }, {} as Record<string, CValue>)
        const result = await EditorBackendApi.runDag(state.dag.name, dataNodes)
        state.renderEngineContext(result)
        return result
    },
}

export default GraphAreaApi
