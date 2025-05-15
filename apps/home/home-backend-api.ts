import { backendRequestBuilder } from "../common/backend-api-common"
import { DagSpec } from "../common/dag-dsl";

const request = backendRequestBuilder("editor")

const HomeBackendApi = {

    async getDags(): Promise<DagSpec[]> {
        return (await request("get", "/dag")).data.data
    }

}

export default HomeBackendApi;
