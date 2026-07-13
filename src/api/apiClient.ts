const DEFAULT_TIMEOUT_MS = 15000;

export type ApiClientOptions = {
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
};

export type RequestOptions = Omit<RequestInit, 'body'> & {
  readonly body?: unknown;
};

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor({ baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL, timeoutMs = DEFAULT_TIMEOUT_MS }: ApiClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.timeoutMs = timeoutMs;
  }

  async get<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
    return this.request<TResponse>(path, { ...options, method: 'GET' });
  }

  async post<TResponse>(path: string, body?: unknown, options: RequestOptions = {}): Promise<TResponse> {
    return this.request<TResponse>(path, { ...options, body, method: 'POST' });
  }

  private async request<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
    if (!this.baseUrl) {
      throw new ApiError('Configure EXPO_PUBLIC_API_BASE_URL para carregar os dados da API.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${normalizePath(path)}`, {
        ...options,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiError('Não foi possível carregar os dados da API.', response.status);
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      return (await response.json()) as TResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('A API demorou demais para responder.');
      }

      throw new ApiError('Falha de conexão com a API.');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function normalizeBaseUrl(baseUrl?: string): string {
  const normalizedBaseUrl = baseUrl?.replace(/\/+$/, '') ?? '';

  if (!normalizedBaseUrl || normalizedBaseUrl.endsWith('/api')) {
    return normalizedBaseUrl;
  }

  return `${normalizedBaseUrl}/api`;
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export const apiClient = new ApiClient();
