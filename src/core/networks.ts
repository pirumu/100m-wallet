import { BtcNetworks } from './btc-networks.constant';

export const NETWORKS = [
  {
    name: 'BTC - Bitcoin',
    network: BtcNetworks.bitcoin.default,
    hd_coin: 0,
  },
  {
    name: 'tBTC - Bitcoin Testnet',
    network: BtcNetworks.bitcoin.p2wpkh.testnet,
    hd_coin: 1,
  },
  {
    name: 'BCH - Bitcoin Cash',
    network: BtcNetworks.bitcoin.default,
    hd_coin: 145,
  },
  {
    name: 'tBCH - Bitcoin Cash Testnet',
    network: BtcNetworks.bitcoin.default,
    hd_coin: 145,
  },
  {
    name: 'ETH - Ethereum',
    network: BtcNetworks.bitcoin.default,
    hd_coin: 60,
  },
  {
    name: 'ETH - Ethereum Testnet',
    network: BtcNetworks.bitcoin.default,
    hd_coin: 60,
  },
];
