import { ExplorersModule } from "./sections/module-explorer/module-explorer-dsl"
import { backendRequestBuilder } from "../common/backend-api-common"

const request = backendRequestBuilder("editor")

const EditorBackendApi = {

    async getBarModules(): Promise<ExplorersModule[]> {
        return (await request("get", "/explorer-modules")).data.data
    }
}

export default EditorBackendApi
