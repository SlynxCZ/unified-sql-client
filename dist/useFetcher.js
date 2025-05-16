import useSWR from "swr";
import axios from "axios";
export var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
export function useFetcher(options) {
    const isGet = options.method === HttpMethod.GET;
    const swr = useSWR(isGet && options.url ? options.url : null, async (url) => {
        const res = await fetch(url);
        if (!res.ok)
            throw new Error(`Error ${res.status}`);
        return res.json();
    }, {
        revalidateOnFocus: false,
        ...(isGet ? options.config : {}),
    });
    if (isGet) {
        return {
            data: swr.data,
            error: swr.error,
            isLoading: !swr.data && !swr.error,
        };
    }
    const { url, payload } = options;
    const trigger = async () => {
        const res = await axios.request({
            method: options.method,
            url,
            data: payload,
        });
        return res.data;
    };
    return { trigger };
}
