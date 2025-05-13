import { BarModule } from "./sections/module-bar/module-bar-dsl"
import { backendRequestBuilder } from "../common/backend-api-common"
import { DagSpec } from "../common/dag-dsl"

const request = backendRequestBuilder("editor")

const EditorBackendApi = {

    async getBarModules(): Promise<BarModule[]> {
        return (await request("get", "/bar-modules")).data.data
    },

    async loadDag(): Promise<DagSpec> {
        return (await request("get", "/dag")).data.data
    }
}

export default EditorBackendApi
