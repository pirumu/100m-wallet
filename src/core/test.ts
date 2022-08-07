import { Mnemonic} from './mnemonic'
import { Language } from './type/language'
import { HDWallet }   from './hd-wallet'
import { BtcNetworks } from './btc-networks.constant'
import * as BIP44 from './type/bips/bip44';

const mn = new Mnemonic(Language.EN)
const mnemonic = mn.generate(128)
const hdwallet = new HDWallet(mn, BtcNetworks.bitcoin.p2wpkh.testnet)

console.log(mnemonic)

console.log('check:', mn.check(mnemonic))

hdwallet.calcBip32RootKeyFromSeed(mnemonic, null)

console.log(
    hdwallet.buildWallet(BIP44.BTC_TESTNET,0,hdwallet.generateBtcWallet)
)
console.log(
    hdwallet.buildWallet(BIP44.BCH,0,hdwallet.generateBchWallet)
)

console.log(
    hdwallet.buildWallet(BIP44.ETH,0,hdwallet.generateEthWallet)
)
