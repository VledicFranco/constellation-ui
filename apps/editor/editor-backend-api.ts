import { backendRequestBuilder } from "../common/backend-api-common"
import { DagSpec, CValue, RuntimeState, ModuleNodeSpec } from "../common/dag-dsl"

const request = backendRequestBuilder("editor")

const EditorBackendApi = {

    async getBarModules(): Promise<ModuleNodeSpec[]> {
        return (await request("get", "/modules")).data.data
    },

    async getDag(name: string): Promise<DagSpec> {
        return (await request("get", `/dag/${name}`)).data.data
    },

    async saveDag(dag: DagSpec): Promise<void> {
        return (await request("put", `/dag/${dag.metadata.name}`, dag)).data.data
    },

    async runDag(name: string, inputs: Record<string, CValue>): Promise<RuntimeState> {
        console.log("Running DAG with inputs:", inputs)
        return (await request("post", `/dag/${name}/run`, inputs)).data.data
    },
}

export default EditorBackendApi
