"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const swr = (0, swr_1.default)(isGet && options.url ? options.url : null, (url) => __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url);
        if (!res.ok)
            throw new Error(`Error ${res.status}`);
        return res.json();
    }), Object.assign({ revalidateOnFocus: false }, (isGet ? options.config : {})));
    if (isGet) {
        return {
            data: swr.data,
            error: swr.error,
            isLoading: !swr.data && !swr.error,
        };
    }
    const { url, payload } = options;
    const trigger = () => __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.request({
            method: options.method,
            url,
            data: payload,
        });
        return res.data;
    });
    return { trigger };
}
