import { backendRequestBuilder } from "../common/backend-api-common"
import { DagMetadata } from "../common/dag-dsl"

const request = backendRequestBuilder("browser-dags")

const BrowserDagsBackendApi = {

    async getDags(): Promise<Record<string, DagMetadata>> {
        return (await request("get", "/")).data.data
    }

}

export default BrowserDagsBackendApi;
