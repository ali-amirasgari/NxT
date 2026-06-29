"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  getWallet,
  listWalletLedger,
  listWallets,
  mutateWallet,
} from "@/apis/queries/wallet/functions";
import type { WalletLedgerParams, WalletMutationPayload } from "@/apis/types/wallet";

export function useWalletsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.wallet.list,
    queryFn: listWallets,
  });
}

export function useWalletQuery(walletId?: string | number) {
  return useQuery({
    queryKey: QUERY_KEYS.wallet.detail(walletId ?? ""),
    queryFn: () => getWallet(walletId as string | number),
    enabled: Boolean(walletId),
  });
}

export function useWalletLedgerQuery(
  walletId?: string | number,
  params?: WalletLedgerParams,
) {
  return useQuery({
    queryKey: QUERY_KEYS.wallet.ledger(walletId ?? "", params),
    queryFn: () => listWalletLedger(walletId as string | number, params),
    enabled: Boolean(walletId),
  });
}

export function useWalletMutation(
  action: "credit" | "debit" | "hold" | "release" | "capture",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.wallet.mutation, action],
    mutationFn: (payload: WalletMutationPayload) => mutateWallet(action, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet.all });
    },
  });
}
