import { create } from "domain"
import { backendRequestBuilder } from "../common/backend-api-common"
import { ComponentMetadata } from "../common/dag-dsl"
import { CreateDagResponse } from "./browser-dags-dsl"

const request = backendRequestBuilder("browser-dags")

const BrowserDagsBackendApi = {

    async getDags(): Promise<Record<string, ComponentMetadata>> {
        return (await request("get", "/")).data.data
    },

    async createDag(name: string): Promise<CreateDagResponse> {
        return (await request("post", `/${name}`)).data.data
    },
}

export default BrowserDagsBackendApi;
