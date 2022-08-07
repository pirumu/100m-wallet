export const BtcNetworks = {
  bitcoin: {
    default: {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'bc',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x00,
      scriptHash: 0x05,
      wif: 0x80,
    },
    p2wpkh: {
      mainnet: {
        baseNetwork: 'bitcoin',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
          public: 0x04b24746,
          private: 0x04b2430c,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
      },
      testnet: {
        baseNetwork: 'testnet',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
          public: 0x045f1cf6,
          private: 0x045f18bc,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
      regtest: {
        baseNetwork: 'regtest',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bcrt',
        bip32: {
          public: 0x045f1cf6,
          private: 0x045f18bc,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
    },
    p2wpkh_in_p2sh: {
      mainnet: {
        baseNetwork: 'bitcoin',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
          public: 0x049d7cb2,
          private: 0x049d7878,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
      },
      testnet: {
        baseNetwork: 'testnet',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
          public: 0x044a5262,
          private: 0x044a4e28,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
      regtest: {
        baseNetwork: 'regtest',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bcrt',
        bip32: {
          public: 0x044a5262,
          private: 0x044a4e28,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
    },
    p2wsh: {
      mainnet: {
        baseNetwork: 'bitcoin',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
          public: 0x02aa7ed3,
          private: 0x02aa7a99,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
      },
      testnet: {
        baseNetwork: 'testnet',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
          public: 0x02575483,
          private: 0x02575048,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
      regtest: {
        baseNetwork: 'regtest',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bcrt',
        bip32: {
          public: 0x02575483,
          private: 0x02575048,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
    },
    p2wsh_in_p2sh: {
      mainnet: {
        baseNetwork: 'bitcoin',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
          public: 0x0295b43f,
          private: 0x0295b005,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
      },
      testnet: {
        baseNetwork: 'testnet',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
          public: 0x024289ef,
          private: 0x024285b5,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
      regtest: {
        baseNetwork: 'regtest',
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bcrt',
        bip32: {
          public: 0x024289ef,
          private: 0x024285b5,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
      },
    },
  },
};
