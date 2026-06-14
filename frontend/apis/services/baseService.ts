import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { API_ROUTES } from "@/apis/API_ROUTES";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

export class BaseService {
  protected client: AxiosInstance | null = null;
  private refreshRequest: Promise<void> | null = null;

  protected getBaseUrl(): string {
    return "/";
  }

  protected getTimeout(): number {
    return 10000;
  }

  private async refreshSession() {
    if (!this.refreshRequest) {
      this.refreshRequest = axios
        .post(API_ROUTES.auth.refresh, undefined, {
          baseURL: "/",
          withCredentials: true,
        })
        .then(() => undefined)
        .finally(() => {
          this.refreshRequest = null;
        });
    }

    return this.refreshRequest;
  }

  protected getClient(): AxiosInstance {
    if (!this.client) {
      this.client = axios.create({
        baseURL: this.getBaseUrl(),
        timeout: this.getTimeout(),
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      this.client.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
          const request = error.config as RetryableRequestConfig | undefined;
          const isRefreshRequest = request?.url === API_ROUTES.auth.refresh;

          if (
            error.response?.status === 401 &&
            request &&
            !request._authRetry &&
            !isRefreshRequest
          ) {
            request._authRetry = true;

            try {
              await this.refreshSession();
              return this.client?.request(request);
            } catch {
              if (typeof window !== "undefined") {
                window.location.assign("/signin");
              }
            }
          }

          return Promise.reject(error);
        }
      );
    }

    return this.client;
  }
}

export default BaseService;
