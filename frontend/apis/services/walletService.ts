import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  Wallet,
  WalletEnvelope,
  WalletLedgerEntry,
  WalletLedgerEnvelope,
  WalletLedgerParams,
  WalletListEnvelope,
  WalletMutationEnvelope,
  WalletMutationPayload,
} from "@/apis/types/wallet";

function compactParams(params?: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  );
}

class WalletService extends BaseService {
  async listWallets(): Promise<Wallet[]> {
    const response = await this.getClient().get<WalletListEnvelope>(
      API_ROUTES.wallet.list,
    );
    return response.data.wallets;
  }

  async getWallet(walletId: string | number): Promise<Wallet> {
    const response = await this.getClient().get<WalletEnvelope>(
      API_ROUTES.wallet.detail(walletId),
    );
    return response.data.wallet;
  }

  async listLedger(
    walletId: string | number,
    params?: WalletLedgerParams,
  ): Promise<WalletLedgerEntry[]> {
    const response = await this.getClient().get<WalletLedgerEnvelope>(
      API_ROUTES.wallet.ledger(walletId),
      { params: compactParams(params) },
    );
    return response.data.entries;
  }

  async mutate(
    action: "credit" | "debit" | "hold" | "release" | "capture",
    payload: WalletMutationPayload,
  ): Promise<WalletMutationEnvelope> {
    const response = await this.getClient().post<WalletMutationEnvelope>(
      API_ROUTES.wallet[action],
      payload,
    );
    return response.data;
  }
}

const walletService = new WalletService();

export default walletService;
