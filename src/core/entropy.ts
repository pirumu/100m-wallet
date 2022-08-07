/**
 * Detects entropy from a string.
 *
 * Formats include:
 * binary [0-1]
 * base 6 [0-5]
 * dice 6 [1-6]
 * decimal [0-9]
 * hexadecimal [0-9A-F]
 * card [A2-9TJQK][CDHS]
 *
 * Automatically uses lowest entropy to avoid issues such as interpretting 0101
 * as hexadecimal which would be 16 bits when really it's only 4 bits of binary
 * entropy.
 *
 */

export default class Entropy {
  private readonly BINARY = 'binary';
  private readonly CARD = 'card';
  private readonly DICE = 'dice';
  private readonly BASE6 = 'base6';
  private readonly BASE10 = 'base10';
  private readonly HEXADECIMAL = 'hexadecimal';

  /**
   *
   *
   * @property eventBits
   */
  private readonly eventBits = {
    /**
     * @property binary
     */
    binary: {
      '0': '0',
      '1': '1',
    },

    /**
     *
     * log2(6) = 2.58496 bits per roll, with bias
     * 4 rolls give 2 bits each
     * 2 rolls give 1 bit each
     * Average (4*2 + 2*1) / 6 = 1.66 bits per roll without bias
     *
     * @property base6
     */
    base6: {
      '0': '00',
      '1': '01',
      '2': '10',
      '3': '11',
      '4': '0',
      '5': '1',
    },

    /**
     * log2(6) = 2.58496 bits per roll, with bias
     * 4 rolls give 2 bits each
     * 2 rolls give 1 bit each
     * Average (4*2 + 2*1) / 6 = 1.66 bits per roll without bias
     *
     * @property base6_dice
     */
    base6_dice: {
      '0': '00', // equivalent to 0 in base 6
      '1': '01',
      '2': '10',
      '3': '11',
      '4': '0',
      '5': '1',
    },

    /**
     * log2(10) = 3.321928 bits per digit, with bias
     * 8 digits give 3 bits each
     * 2 digits give 1 bit each
     *  Average (8*3 + 2*1) / 10 = 2.6 bits per digit without bias
     *
     *  @property base10
     */
    base10: {
      '0': '000',
      '1': '001',
      '2': '010',
      '3': '011',
      '4': '100',
      '5': '101',
      '6': '110',
      '7': '111',
      '8': '0',
      '9': '1',
    },

    /**
     * @property hexadecimal
     */
    hexadecimal: {
      '0': '0000',
      '1': '0001',
      '2': '0010',
      '3': '0011',
      '4': '0100',
      '5': '0101',
      '6': '0110',
      '7': '0111',
      '8': '1000',
      '9': '1001',
      a: '1010',
      b: '1011',
      c: '1100',
      d: '1101',
      e: '1110',
      f: '1111',
    },

    /**
     * log2(52) = 5.7004 bits per card, with bias
     * 32 cards give 5 bits each
     * 16 cards give 4 bits each
     * 4 cards give 2 bits each
     * Average (32*5 + 16*4 + 4*2) / 52 = 4.46 bits per card without bias
     *
     * @property card
     */
    card: {
      ac: '00000',
      '2c': '00001',
      '3c': '00010',
      '4c': '00011',
      '5c': '00100',
      '6c': '00101',
      '7c': '00110',
      '8c': '00111',
      '9c': '01000',
      tc: '01001',
      jc: '01010',
      qc: '01011',
      kc: '01100',
      ad: '01101',
      '2d': '01110',
      '3d': '01111',
      '4d': '10000',
      '5d': '10001',
      '6d': '10010',
      '7d': '10011',
      '8d': '10100',
      '9d': '10101',
      td: '10110',
      jd: '10111',
      qd: '11000',
      kd: '11001',
      ah: '11010',
      '2h': '11011',
      '3h': '11100',
      '4h': '11101',
      '5h': '11110',
      '6h': '11111',
      '7h': '0000',
      '8h': '0001',
      '9h': '0010',
      th: '0011',
      jh: '0100',
      qh: '0101',
      kh: '0110',
      as: '0111',
      '2s': '1000',
      '3s': '1001',
      '4s': '1010',
      '5s': '1011',
      '6s': '1100',
      '7s': '1101',
      '8s': '1110',
      '9s': '1111',
      ts: '00',
      js: '01',
      qs: '10',
      ks: '11',
    },
  };

  /**
   * matchers returns an array of the matched events for each type of entropy.
   * eg
   * matchers.binary("010") returns ["0", "1", "0"]
   * matchers.binary("a10") returns ["1", "0"]
   * matchers.hex("a10") returns ["a", "1", "0"]
   *
   * @property matchers
   */

  private readonly matchers = {
    binary: function (str) {
      return str.match(/[0-1]/gi) || [];
    },
    base6: function (str) {
      return str.match(/[0-5]/gi) || [];
    },
    dice: function (str) {
      return str.match(/[1-6]/gi) || []; // ie dice numbers
    },
    base10: function (str) {
      return str.match(/[0-9]/gi) || [];
    },
    hex: function (str) {
      return str.match(/[0-9A-F]/gi) || [];
    },
    card: function (str) {
      // Format is NumberSuit, eg
      // AH ace of hearts
      // 8C eight of clubs
      // TD ten of diamonds
      // JS jack of spades
      // QH queen of hearts
      // KC king of clubs
      return str.match(/([A2-9TJQK][CDHS])/gi) || [];
    },
  };

  /**
   * Get entropy string from rawEntropy and base type
   *
   * @param rawEntropyStr
   * @param baseStr
   */
  public fromString(rawEntropyStr, baseStr) {
    // Find type of entropy being used (binary, hex, dice etc)
    const base = this.getBase(rawEntropyStr, baseStr);
    // Convert dice to base6 entropy (ie 1-6 to 0-5)
    // This is done by changing all 6s to 0s
    if (base.str == 'dice') {
      const newEvents = [];
      for (let i = 0; i < base.events.length; i++) {
        const c = base.events[i];
        if ('12345'.indexOf(c) > -1) {
          newEvents[i] = base.events[i];
        } else {
          newEvents[i] = '0';
        }
      }
      base.str = 'base 6 (dice)';
      base.events = newEvents;
      base.matcher = this.matchers.base6;
    }
    // Detect empty entropy
    if (base.events.length == 0) {
      return {
        binaryStr: '',
        cleanStr: '',
        entropy: '',
        base: base,
      };
    }
    // Convert entropy events to binary
    const entropyBin = base.events
      .map((e) => {
        return this.eventBits[base.str][e.toLowerCase()];
      })
      .join('');
    // Get average bits per event
    // which may be adjusted for bias if log2(base) is fractional
    const bitsPerEvent = base.bitsPerEvent;
    // Supply a 'filtered' entropy string for display purposes
    let entropyClean = base.events.join('');
    let entropy = base.events.join('');
    if (base.asInt == 52) {
      entropyClean = base.events.join(' ').toUpperCase();
      entropyClean = entropyClean.replace(/C/g, '\u2663');
      entropyClean = entropyClean.replace(/D/g, '\u2666');
      entropyClean = entropyClean.replace(/H/g, '\u2665');
      entropyClean = entropyClean.replace(/S/g, '\u2660');

      entropy = base.events.join(' ').toUpperCase();
      entropy = entropy
        .replace(/C/g, '\u2663')
        .replace(/D/g, '\u2666')
        .replace(/H/g, '\u2665')
        .replace(/S/g, '\u2660');
    }
    // Return the result
    return {
      binaryStr: entropyBin,
      cleanStr: entropyClean,
      entropy: entropy,
      bitsPerEvent: bitsPerEvent,
      base: base,
    };
  }

  /**
   * Get base type from string type
   *
   * @param str
   * @param baseStr
   */
  private getBase(str, baseStr) {
    // Need to get the lowest base for the supplied entropy.
    // This prevents interpreting, say, dice rolls as hexadecimal.
    const binaryMatches = this.matchers.binary(str);
    const hexMatches = this.matchers.hex(str);
    const autodetect = baseStr === undefined;
    let ints = undefined;
    // Find the lowest base that can be used, whilst ignoring any irrelevant chars
    if (
      (binaryMatches.length == hexMatches.length && hexMatches.length > 0 && autodetect) ||
      baseStr === this.BINARY
    ) {
      ints = binaryMatches.map((i) => {
        return parseInt(i, 2);
      });
      return {
        ints: ints,
        events: binaryMatches,
        matcher: this.matchers.binary,
        asInt: 2,
        bitsPerEvent: 1,
        str: this.BINARY,
      };
    }
    const cardMatches = this.matchers.card(str);
    if ((cardMatches.length >= hexMatches.length / 2 && autodetect) || baseStr === this.CARD) {
      return {
        ints: ints,
        events: cardMatches,
        matcher: this.matchers.card,
        asInt: 52,
        bitsPerEvent: (32 * 5 + 16 * 4 + 4 * 2) / 52, // see cardBits
        str: this.CARD,
      };
    }
    const diceMatches = this.matchers.dice(str);
    if (
      (diceMatches.length == hexMatches.length && hexMatches.length > 0 && autodetect) ||
      baseStr === this.DICE
    ) {
      ints = diceMatches.map((i) => {
        return parseInt(i);
      });
      return {
        ints: ints,
        events: diceMatches,
        matcher: this.matchers.dice,
        asInt: 6,
        bitsPerEvent: (4 * 2 + 2 * 1) / 6, // see diceBits
        str: this.DICE,
      };
    }
    const base6Matches = this.matchers.base6(str);
    if (
      (base6Matches.length == hexMatches.length && hexMatches.length > 0 && autodetect) ||
      baseStr === this.BASE6
    ) {
      ints = base6Matches.map((i) => {
        return parseInt(i);
      });
      return {
        ints: ints,
        events: base6Matches,
        matcher: this.matchers.base6,
        asInt: 6,
        bitsPerEvent: (4 * 2 + 2 * 1) / 6, // see diceBits
        str: this.BASE6,
      };
    }
    const base10Matches = this.matchers.base10(str);
    if (
      (base10Matches.length == hexMatches.length && hexMatches.length > 0 && autodetect) ||
      baseStr === this.BASE10
    ) {
      ints = base10Matches.map((i) => {
        return parseInt(i);
      });
      return {
        ints: ints,
        events: base10Matches,
        matcher: this.matchers.base10,
        asInt: 10,
        bitsPerEvent: (8 * 3 + 2 * 1) / 10, // see b10Bits
        str: this.BASE10,
      };
    }
    ints = hexMatches.map((i) => {
      return parseInt(i, 16);
    });
    return {
      ints: ints,
      events: hexMatches,
      matcher: this.matchers.hex,
      asInt: 16,
      bitsPerEvent: 4,
      str: this.HEXADECIMAL,
    };
  }
}
