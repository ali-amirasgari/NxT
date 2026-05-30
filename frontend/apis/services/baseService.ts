import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class BaseService {
  protected client: AxiosInstance | null = null;

  protected getClient(): AxiosInstance {
    if (!this.client) {
      this.client = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.client.interceptors.request.use(
        (config: AxiosRequestConfig) => {
          const token = this.getAccessToken();

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          return config;
        },
        (error: AxiosError) => Promise.reject(error)
      );

      this.client.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.assign("/signin");
          }

          return Promise.reject(error);
        }
      );
    }

    return this.client;
  }

  protected getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("access_token");
  }
}

export default BaseService;
