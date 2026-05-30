"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import { loginUser, registerUser } from "@/apis/queries/auth/functions";

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationKey: QUERY_KEYS.auth.register,
    mutationFn: registerUser,
    onSuccess: (response) => {
      const accessToken = response.access_token ?? response.access;
      const refreshToken = response.refresh_token ?? response.refresh;

      if (typeof window !== "undefined") {
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }

      router.push("/signin");
    },
  });
}

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationKey: QUERY_KEYS.auth.login,
    mutationFn: loginUser,
    onSuccess: (response) => {
      const accessToken = response.access_token ?? response.access;
      const refreshToken = response.refresh_token ?? response.refresh;

      if (typeof window !== "undefined") {
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }

      router.push("/landing");
    },
  });
}
