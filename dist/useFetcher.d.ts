import { SWRConfiguration } from "swr";
export declare enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}
type UseFetcherGetOptions = {
    method: HttpMethod.GET;
    url: string | null;
    config?: SWRConfiguration;
};
type UseFetcherMutateOptions<TPayload = any> = {
    method: HttpMethod.POST | HttpMethod.PUT | HttpMethod.DELETE;
    url: string;
    payload?: TPayload;
};
export declare function useFetcher<TResponse = any>(options: UseFetcherGetOptions): {
    data: TResponse | undefined;
    error: any;
    isLoading: boolean;
};
export declare function useFetcher<TResponse = any, TPayload = any>(options: UseFetcherMutateOptions<TPayload>): {
    trigger: () => Promise<TResponse>;
};
export {};
