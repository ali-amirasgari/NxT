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
      router.replace(response.authenticated ? "/app" : "/signin");
      router.refresh();
    },
  });
}

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationKey: QUERY_KEYS.auth.login,
    mutationFn: loginUser,
    onSuccess: () => {
      router.replace("/app");
      router.refresh();
    },
  });
}
