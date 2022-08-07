import * as sjcl from './lib/sjcl';
import { WORDLIST } from './wordlist';
import * as nodeCrypto from 'crypto';
import Entropy from './entropy';
import { EventBit } from './type/event_bits';
import { Language } from './type/language';

export class Mnemonic {
  private readonly RADIX = 2048;
  private readonly PBKDF2_ROUNDS = 2048;
  private readonly wordlist: string[];

  public constructor(public language: Language) {
    this.wordlist = WORDLIST[this.language];
    if (this.wordlist.length !== this.RADIX) {
      throw new Error(
        `Wordlist should contain ${this.RADIX} words, but it contains ${this.wordlist.length} words.`
      );
    }
  }

  /**
   *
   * @param strength
   */
  public generate(strength: number) {
    strength = strength || 128;
    const r = strength % 32;
    if (r > 0) {
      throw new Error(`Strength should be divisible by 32, but it is not (${r}).`);
    }

    const buffer = new Uint8Array(strength / 8);
    const data = this.getRandomValues(buffer);
    return this.toMnemonic(data);
  }

  /**
   *
   * @param byteArray
   */
  private toMnemonic(byteArray) {
    if (byteArray.length % 4 > 0) {
      throw new Error(
        `Data length in bits should be divisible by 32, but it is not ( ${
          byteArray.length
        } bytes = ${byteArray.length * 8} bits).`
      );
    }

    const data = this.byteArrayToWordArray(byteArray);
    const hash = sjcl.hash.sha256.hash(data);
    const h = sjcl.codec.hex.fromBits(hash);
    const a = this.byteArrayToBinaryString(byteArray);
    const c = this.zfill(this.hexStringToBinaryString(h), 256);
    const d = c.substring(0, (byteArray.length * 8) / 32);
    // b = line1 + line2
    const b = a + d;

    const result = [];
    const blen = b.length / 11;
    for (let i = 0; i < blen; i++) {
      const idx = parseInt(b.substring(i * 11, (i + 1) * 11), 2);
      result.push(this.wordlist[idx]);
    }
    return this.joinWords(result);
  }

  /**
   *
   * @param mnemonic
   */
  public check(mnemonic) {
    const b = this.mnemonicToBinaryString(mnemonic);
    if (b === null) {
      return false;
    }
    const l = b.length;
    //d = b[:l / 33 * 32]
    //h = b[-l / 33:]
    const d = b.substring(0, (l / 33) * 32);
    const h = b.substring(l - l / 33, l);
    const nd = this.binaryStringToWordArray(d);
    const ndHash = sjcl.hash.sha256.hash(nd);
    const ndHex = sjcl.codec.hex.fromBits(ndHash);
    const ndBstr = this.zfill(this.hexStringToBinaryString(ndHex), 256);
    const nh = ndBstr.substring(0, l / 33);
    return h == nh;
  }

  /**
   *
   * @param mnemonic
   */
  public toRawEntropyHex(mnemonic) {
    const b = this.mnemonicToBinaryString(mnemonic);
    if (b === null) return null;
    const d = b.substring(0, (b.length / 33) * 32);
    const nd = this.binaryStringToWordArray(d);

    let h = '';
    for (let i = 0; i < nd.length; i++) {
      h += ('0000000' + nd[i].toString(16)).slice(-8);
    }
    return h;
  }

  /**
   *
   * @param mnemonic
   */
  public toRawEntropyBin(mnemonic) {
    const b = this.mnemonicToBinaryString(mnemonic);
    return b.substring(0, (b.length / 33) * 32);
  }

  /**
   *
   * @param mnemonic
   * @param passphrase
   */
  public toSeed(mnemonic, passphrase) {
    passphrase = passphrase || '';
    mnemonic = this.joinWords(this.splitWords(mnemonic)); // removes duplicate blanks
    const mnemonicNormalized = this.normalizeString(mnemonic);
    passphrase = this.normalizeString(passphrase);
    const mnemonicBits = sjcl.codec.utf8String.toBits(mnemonicNormalized);
    const passphraseBits = sjcl.codec.utf8String.toBits('mnemonic' + passphrase);
    const result = sjcl.misc.pbkdf2(
      mnemonicBits,
      passphraseBits,
      this.PBKDF2_ROUNDS,
      512,
      sjcl.misc.hmac
    );
    return sjcl.codec.hex.fromBits(result);
  }

  /**
   *
   * @param mnemonic
   */
  private splitWords(mnemonic: string) {
    return mnemonic.split(/\s/g).filter((x) => x.length);
  }

  /**
   * Join Words
   *
   * Set space correctly depending on the language
   * see https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#japanese
   * @param words
   */
  private joinWords(words): string {
    let space = ' ';
    if (this.language == 'jp') {
      space = '\u3000'; // ideographic space
    }
    return words.join(space);
  }

  /**
   *
   * @param str
   */
  private normalizeString(str) {
    return str.normalize('NFKD');
  }

  /**
   *
   * @param data
   */
  private byteArrayToWordArray(data) {
    const a = [];
    for (let i = 0; i < data.length / 4; i++) {
      let v = 0;
      v += data[i * 4 + 0] << (8 * 3);
      v += data[i * 4 + 1] << (8 * 2);
      v += data[i * 4 + 2] << (8 * 1);
      v += data[i * 4 + 3] << (8 * 0);
      a.push(v);
    }
    return a;
  }

  /**
   *
   * @param data
   */
  private byteArrayToBinaryString(data) {
    let bin = '';
    for (let i = 0; i < data.length; i++) {
      bin += this.zfill(data[i].toString(2), 8);
    }
    return bin;
  }

  /**
   *
   * @param hexString
   */
  private hexStringToBinaryString(hexString) {
    let binaryString = '';
    for (let i = 0; i < hexString.length; i++) {
      binaryString += this.zfill(parseInt(hexString[i], 16).toString(2), 4);
    }
    return binaryString;
  }

  /**
   *
   * @param binary
   */
  private binaryStringToWordArray(binary) {
    const aLen = binary.length / 32;
    const a = [];
    for (let i = 0; i < aLen; i++) {
      const valueStr = binary.substring(0, 32);
      const value = parseInt(valueStr, 2);
      a.push(value);
      binary = binary.slice(32);
    }
    return a;
  }

  /**
   *
   * @param mnemonic
   */
  private mnemonicToBinaryString(mnemonic) {
    mnemonic = this.splitWords(mnemonic);
    if (mnemonic.length == 0 || mnemonic.length % 3 > 0) {
      return null;
    }
    const idx = [];
    for (let i = 0; i < mnemonic.length; i++) {
      const word = mnemonic[i];
      const wordIndex = this.wordlist.indexOf(word);
      if (wordIndex == -1) {
        return null;
      }
      const binaryIndex = this.zfill(wordIndex.toString(2), 11);
      idx.push(binaryIndex);
    }
    return idx.join('');
  }

  /**
   * Pad a numeric string on the left with zero digits until the given width
   * is reached.
   * Note this differs to the python implementation because it does not
   * handle numbers starting with a sign.
   *
   * @param source
   * @param length
   */
  private zfill(source, length) {
    let src = source.toString();
    while (src.length < length) {
      src = '0' + src;
    }
    return src;
  }

  /**
   *
   * @param buf
   */
  private getRandomValues(buf: Uint8Array) {
    if (nodeCrypto.randomBytes) {
      if (buf.length > 65536) {
        throw new Error(
          `Failed to execute getRandomValues on Crypto: The ArrayBufferView's byte length (${buf.length}) exceeds the number of bytes of entropy available via this API (65536).`
        );
      }
      const bytes = nodeCrypto.randomBytes(buf.length);
      buf.set(bytes);
      return buf;
    } else {
      throw new Error('No secure random number generator available.');
    }
  }

  /**
   *
   * @param entropyStr
   * @param type
   * @param mnemonicLength
   */
  public generateMnemonicFromEntropy(entropyStr: string, type: EventBit, mnemonicLength) {
    const entropy = new Entropy();

    const entropyString = entropy.fromString(entropyStr, type);

    if (entropyString.binaryStr.length == 0) {
      return;
    }
    // Use entropy hash if not using raw entropy
    let bits = entropyString.binaryStr;

    if (mnemonicLength != 'raw') {
      // Get bits by hashing entropy with SHA256
      const hash = sjcl.hash.sha256.hash(entropyString.cleanStr);
      const hex = sjcl.codec.hex.fromBits(hash);
      bits = BigInt(hex).toString(2);
      while (bits.length % 256 != 0) {
        bits = '0' + bits;
      }
      // Truncate hash to suit number of words
      mnemonicLength = parseInt(mnemonicLength);
      const numberOfBits = (32 * mnemonicLength) / 3;
      bits = bits.substring(0, numberOfBits);
      // show warning for weak entropy override
      if ((mnemonicLength / 3) * 32 < entropyString.binaryStr.length) {
        throw new Error('Entropy override weaker than the old entropy');
      }
    }
    // Discard trailing entropy
    const bitsToUse = Math.floor(bits.length / 32) * 32;
    const start = bits.length - bitsToUse;
    const binaryStr = bits.substring(start);
    // Convert entropy string to numeric array
    const entropyArr = [];
    for (let i = 0; i < binaryStr.length / 8; i++) {
      const byteAsBits = binaryStr.substring(i * 8, i * 8 + 8);
      const entropyByte = parseInt(byteAsBits, 2);
      entropyArr.push(entropyByte);
    }
    // Convert entropy array to mnemonic
    const phrase = this.toMnemonic(entropyArr);

    const words = this.phraseToWordArray(phrase);
    const wordIndexes = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordIndex = WORDLIST[this.language].indexOf(word);
      wordIndexes.push(wordIndex);
    }
    return wordIndexes.join(', ');
  }

  /**
   *
   * @param phrase
   */
  private phraseToWordArray(phrase) {
    const words = phrase.split(/\s/g);
    const noBlanks = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length > 0) {
        noBlanks.push(word);
      }
    }
    return noBlanks;
  }
}
