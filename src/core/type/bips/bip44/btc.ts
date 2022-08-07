import { Bip44 } from '../interface/bip44';

export const BTC = <Bip44>{
  purpose: 44,
  coin: 0,
  account: 0,
  change: 0,
};

export const BTC_TESTNET = <Bip44>{
  purpose: 44,
  coin: 1,
  account: 0,
  change: 0,
};

export const BTC_REGNET = <Bip44>{
  purpose: 44,
  coin: 1,
  account: 0,
  change: 0,
};
