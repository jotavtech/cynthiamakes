import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (res.status === 401) {
    console.log("Status 401 detectado, mas permitindo continuar");
    return;
  }
  
  if (!res.ok) {
    let errorData;
    try {
      const text = await res.text();
      errorData = text ? JSON.parse(text) : { message: res.statusText };
    } catch {
      errorData = { message: res.statusText };
    }
    
    const error = new Error(errorData.message || `${res.status}: ${res.statusText}`);
    (error as any).status = res.status;
    (error as any).data = errorData;
    (error as any).response = { status: res.status, data: errorData };
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      staleTime: 0,
      retry: 1,
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});
