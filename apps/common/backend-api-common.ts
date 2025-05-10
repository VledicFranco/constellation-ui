import axios, { AxiosError, AxiosResponse, Method } from "axios"
import urljoin from "url-join"
import { v4 } from "uuid"

export type ApiResponse<T> = {
    data: T
}

export function backendRequestBuilder(appName: string) {
    return async function<ReqData = any, ResData = any>(
        method: Method,
        endpoint: string,
        data?: ReqData
    ): Promise<AxiosResponse<ApiResponse<ResData>>> {
        const traceId = v4()
        const baseURL = urljoin(process.env["NEXT_PUBLIC_API_BASE_HOSTNAME"] ?? "http://localhost:1337", "/api", appName)
        if (baseURL.includes("localhost")) 
            console.log(`${method}: ${baseURL}\ntrace-id: ${traceId}`)
        return await axios.request<ResData, AxiosResponse<ApiResponse<ResData>>, ReqData>({
            method,
            baseURL,
            url: endpoint,
            data,
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                "Trace-ID": traceId
            },
            timeout: 5000,
        })
    }
}
