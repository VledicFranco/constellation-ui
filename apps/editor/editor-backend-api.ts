import { ExplorersModule } from "./sections/module-explorer/module-explorer-dsl"
import { backendRequestBuilder } from "../common/backend-api-common"
import { DagSpec } from "../common/dag-dsl"

const request = backendRequestBuilder("editor")

const EditorBackendApi = {

    async getBarModules(): Promise<ExplorersModule[]> {
        return (await request("get", "/modules")).data.data
    },

    async getDag(name: string): Promise<DagSpec> {
        return (await request("get", `/dag/${name}`)).data.data
    }
}

export default EditorBackendApi
