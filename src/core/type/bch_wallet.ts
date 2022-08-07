import { InfoWallet } from './info_wallet';

export type BCHWallet = InfoWallet & {
  cash_address: string;
};
