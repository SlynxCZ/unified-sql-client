"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMethod = void 0;
exports.useFetcher = useFetcher;
const swr_1 = __importDefault(require("swr"));
const axios_1 = __importDefault(require("axios"));
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
function useFetcher(options) {
    const isGet = options.method === HttpMethod.GET;
    const swr = (0, swr_1.default)(isGet && options.url ? options.url : null, async (url) => {
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
        const res = await axios_1.default.request({
            method: options.method,
            url,
            data: payload,
        });
        return res.data;
    };
    return { trigger };
}
