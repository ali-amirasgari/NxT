import walletService from "@/apis/services/walletService";
import type { WalletLedgerParams, WalletMutationPayload } from "@/apis/types/wallet";

export function listWallets() {
  return walletService.listWallets();
}

export function getWallet(walletId: string | number) {
  return walletService.getWallet(walletId);
}

export function listWalletLedger(
  walletId: string | number,
  params?: WalletLedgerParams,
) {
  return walletService.listLedger(walletId, params);
}

export function mutateWallet(
  action: "credit" | "debit" | "hold" | "release" | "capture",
  payload: WalletMutationPayload,
) {
  return walletService.mutate(action, payload);
}
