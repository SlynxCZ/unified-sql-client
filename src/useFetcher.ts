import useSWR, { SWRConfiguration } from "swr";
import axios, { Method } from "axios";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
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

export function useFetcher<TResponse = any>(
  options: UseFetcherGetOptions
): {
  data: TResponse | undefined;
  error: any;
  isLoading: boolean;
};

export function useFetcher<TResponse = any, TPayload = any>(
  options: UseFetcherMutateOptions<TPayload>
): {
  trigger: () => Promise<TResponse>;
};

export function useFetcher<TResponse = any, TPayload = any>(
  options: UseFetcherGetOptions | UseFetcherMutateOptions<TPayload>
) {
  const isGet = options.method === HttpMethod.GET;

  const swr = useSWR<TResponse>(
    isGet && options.url ? options.url : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    },
    {
      revalidateOnFocus: false,
      ...(isGet ? (options as UseFetcherGetOptions).config : {}),
    }
  );

  if (isGet) {
    return {
      data: swr.data,
      error: swr.error,
      isLoading: !swr.data && !swr.error,
    };
  }

  const { url, payload } = options as UseFetcherMutateOptions<TPayload>;

  const trigger = async () => {
    const res = await axios.request<TResponse>({
      method: options.method as Method,
      url,
      data: payload,
    });

    return res.data;
  };

  return { trigger };
}
