export interface WalletPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  perCredit: number;
}

export const WALLET_RECHARGE_PACKAGES: Record<string, WalletPackage> = {
  PACK_2000: {
    id: 'PACK_2000',
    name: 'Starter Adherence Pack',
    credits: 2000,
    price: 499,
    perCredit: 0.25,
  },
  PACK_5000: {
    id: 'PACK_5000',
    name: 'Clinic Growth Pack',
    credits: 5000,
    price: 999,
    perCredit: 0.20,
  },
  PACK_10000: {
    id: 'PACK_10000',
    name: 'High-Volume OPD Pack',
    credits: 10000,
    price: 1799,
    perCredit: 0.18,
  },
};
