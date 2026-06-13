import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

export class BaseService {
  protected client: AxiosInstance | null = null;

  protected getClient(): AxiosInstance {
    if (!this.client) {
      this.client = axios.create({
        baseURL: "/",
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      this.client.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401 && typeof window !== "undefined") {
            window.location.assign("/signin");
          }

          return Promise.reject(error);
        }
      );
    }

    return this.client;
  }
}

export default BaseService;
