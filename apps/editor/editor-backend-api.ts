import { ExplorersModule } from "./sections/module-explorer/module-explorer-dsl"
import { backendRequestBuilder } from "../common/backend-api-common"
import { DagSpec, CValue, EngineContext } from "../common/dag-dsl"

const request = backendRequestBuilder("editor")

const EditorBackendApi = {

    async getBarModules(): Promise<ExplorersModule[]> {
        return (await request("get", "/modules")).data.data
    },

    async getDag(name: string): Promise<DagSpec> {
        return (await request("get", `/dag/${name}`)).data.data
    },

    async saveDag(name: string, dag: DagSpec): Promise<void> {
        return (await request("post", `/dag/${name}`, dag)).data.data
    },

    async runDag(name: string, inputs: Record<string, CValue>): Promise<EngineContext> {
        return (await request("post", `/dag/${name}/run`, inputs)).data.data
    },
}

export default EditorBackendApi
