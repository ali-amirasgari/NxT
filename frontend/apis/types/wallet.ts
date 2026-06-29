export type WalletKind = "money" | "points";
export type WalletStatus = "active" | "frozen" | "closed";
export type WalletEntryType = "credit" | "debit" | "hold" | "release" | "capture" | "adjustment";
export type WalletReason =
  | "admin_adjustment"
  | "goal_stake_hold"
  | "goal_stake_release"
  | "goal_stake_capture"
  | "reward"
  | "refund";

export type Wallet = {
  id: number;
  kind: WalletKind;
  currency: string;
  status: WalletStatus;
  available_balance: string;
  held_balance: string;
  created_at: string;
  updated_at: string;
};

export type WalletLedgerEntry = {
  id: number;
  wallet_id: number;
  entry_type: WalletEntryType;
  amount: string;
  balance_after: string;
  held_balance_after: string;
  reason: WalletReason;
  reference_type: string;
  reference_id?: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type WalletLedgerParams = Partial<{
  limit: number;
  entry_type: WalletEntryType;
  reason: WalletReason;
}>;

export type WalletMutationPayload = {
  kind: WalletKind;
  currency?: string;
  amount: string;
  reason: WalletReason;
  reference_type?: string;
  reference_id?: number | null;
  idempotency_key?: string;
  metadata?: Record<string, unknown>;
};

export type WalletListEnvelope = { wallets: Wallet[] };
export type WalletEnvelope = { wallet: Wallet };
export type WalletLedgerEnvelope = { entries: WalletLedgerEntry[] };
export type WalletMutationEnvelope = { entry: WalletLedgerEntry; wallet: Wallet };
