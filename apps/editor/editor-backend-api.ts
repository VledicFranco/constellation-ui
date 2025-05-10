import { BarModule } from "./sections/module-bar/module-bar-dsl"
import { backendRequestBuilder } from "../common/backend-api-common"

const request = backendRequestBuilder("editor")

const EditorBackendApi = {

    async getBarModules(): Promise<BarModule[]> {
        return (await request("get", "/bar-modules")).data.data
    }
}

export default EditorBackendApi
