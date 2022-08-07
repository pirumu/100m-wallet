import { Mnemonic } from './mnemonic'
import * as BTCUtil from 'bitcoinjs-lib'
import * as ETHUtil from 'ethereumjs-util'
import * as BCHUtil from 'bchaddrjs'
import { Bip44 } from './type/bips/interface/bip44'
import { InfoWallet } from './type/info_wallet'
import { BCHWallet } from './type/bch_wallet'

export  class HDWallet {
  private mnemonic: Mnemonic
  private bip32RootKey: BTCUtil.HDNode
  private network: any

  constructor(mnemonic: Mnemonic, network) {
    this.mnemonic = mnemonic
    this.network = network
  }

  private parseIntNoNaN(val, defaultVal) {
    const v = parseInt(val)
    if (isNaN(v)) {
      return defaultVal
    }
    return v
  }

  private getDerivationPathBip44(input: Bip44): string {
    const purpose = this.parseIntNoNaN(input.purpose, 44)
    const coin = this.parseIntNoNaN(input.coin, 0)
    const account = this.parseIntNoNaN(input.account, 0)
    const change = this.parseIntNoNaN(input.change, 0)

    return `m/${purpose}'/${coin}'/${account}'/${change}`
  }

  public getBip44Info(input: Bip44) {
    // Get the derivation path for the account
    const path = this.getDerivationPathBip44(input)
    // Calculate the account extended keys
    return this.calcBip32ExtendedKey(path)
  }

  public calcBip32RootKeyFromSeed(mnemonicString, passphrase) {
    const seed = this.mnemonic.toSeed(mnemonicString, passphrase)
    this.bip32RootKey = BTCUtil.HDNode.fromSeedHex(seed, this.network)
  }

  public getBip32RootKey() {
    return this.bip32RootKey
  }
  private calcBip32ExtendedKey(path) {
    let extendedKey = this.bip32RootKey
    // Derive the key from the path
    const pathBits = path.split('/')

    for (let i = 0; i < pathBits.length; i++) {
      const bit = pathBits[i]
      const index = parseInt(bit)
      if (isNaN(index)) {
        continue
      }
      const hardened = bit[bit.length - 1] == "'"
      const isPriv = !extendedKey.isNeutered()
      const invalidDerivationPath = hardened && !isPriv
      if (invalidDerivationPath) {
        extendedKey = null
      } else if (hardened) {
        extendedKey = extendedKey.deriveHardened(index)
      } else {
        extendedKey = extendedKey.derive(index)
      }
    }
    return extendedKey
  }

  private networkHasSegwit() {
    return false
  }

  public generateBtcWallet(hdNode: BTCUtil.HDNode) : InfoWallet{

    // get address
    let address = hdNode.keyPair.getAddress().toString()
    let privateKey = 'NA'
    if (!hdNode.isNeutered()) {
      privateKey = hdNode.keyPair.toWIF()
    }
    let publicKey = hdNode.keyPair.getPublicKeyBuffer().toString('hex')

    return <InfoWallet> {
      coin: 'BTC',
      address: address,
      public_key: publicKey,
      private_key: privateKey,
    }

  }
  public generateBchWallet(hdNode: BTCUtil.HDNode) : BCHWallet {
    // get address
    const address = hdNode.keyPair.getAddress().toString()
    let privateKey = 'NA'
    if (!hdNode.isNeutered()) {
      privateKey = hdNode.keyPair.toWIF()
    }
    const publicKey = hdNode.keyPair.getPublicKeyBuffer().toString('hex')

    const cashAddress = BCHUtil.toCashAddress(address)

    const legacyAddress = BCHUtil.toBitpayAddress(address)

    return  <BCHWallet> {
      coin: 'BCH',
      address: legacyAddress,
      cash_address: cashAddress,
      public_key: publicKey,
      private_key: privateKey,
    }
  }
  public generateEthWallet(hdNode: BTCUtil.HDNode) : InfoWallet {

    const pubkeyBuffer = hdNode.keyPair.getPublicKeyBuffer()
    const ethPubkey = ETHUtil.importPublic(pubkeyBuffer)
    const addressBuffer = ETHUtil.publicToAddress(ethPubkey)
    const hexAddress = addressBuffer.toString('hex')
    const checksumAddress = ETHUtil.toChecksumAddress('0x' + hexAddress)
    const ethAddress = ETHUtil.addHexPrefix(checksumAddress)
    const ethPublicKey = ETHUtil.addHexPrefix(pubkeyBuffer.toString('hex'))
    let ethPrivateKey = ''
    if (!hdNode.isNeutered()) {
      ethPrivateKey = ETHUtil.bufferToHex(hdNode.keyPair.d.toBuffer(16))
    }
    return <InfoWallet> {
      coin: 'ETH',
      address: ethAddress,
      public_key: ethPublicKey,
      private_key: ethPrivateKey,
    }
  }
  public buildWallet(input: Bip44, index, cb: (hdNode: BTCUtil.HDNode) => InfoWallet ): InfoWallet {

    const hdNode = this.getBip44Info(input).derive(index)

    return cb(hdNode);

  }
}
