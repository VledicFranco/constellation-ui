import { CValue, DagSpec, DataNodeSpec, EngineContext, getDagInputs, ModuleNodeSpec, parseStringToCValue } from "@/apps/common/dag-dsl";
import { useGraphAreaStore } from "./graph-area-state";
import EditorBackendApi from "../../editor-backend-api";
import * as R from "remeda"

const GraphAreaApi = {

    async addModule(module: ModuleNodeSpec): Promise<void> {
        useGraphAreaStore.getState().addModuleToDag(module)
    },

    getDag(): DagSpec {
        return useGraphAreaStore.getState().dag
    },

    onDagChange(callback: (dag: DagSpec) => void) {
        useGraphAreaStore.subscribe((state, previousState) => {
            return (!R.isDeepEqual(state.dag, previousState.dag)) && callback(state.dag)
        })
    },

    async runDagWithInputs(inputs: Record<string, CValue>): Promise<EngineContext> {
        const state = useGraphAreaStore.getState()
        const result = await EditorBackendApi.runDag(state.dag.name, inputs)
        state.renderEngineContext(result)
        return result
    },

    cleanEngineContext(): void {
        useGraphAreaStore.getState().cleanEngineContext()
    },
}

export default GraphAreaApi
