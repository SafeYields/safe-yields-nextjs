export const addresses = {
  42161: {
    emmaVault: '0x3Dc49d34704386D301c4e407B40b3eCF05225cd5',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    sayStaker: '0x0Cea072f4490fAA57fcA58AA9339D4B71210bcd4',
    vesting: '0x83834a1D647E84402e76Dd542aD95103aE6Bf478',
    sayAirdrop: '0xd8A431dD22478158f174448fC9d435348cc8316a',
  },
  747: {
    emmaVault: '0x12285e4C23776E7A7501C043D282572A3EAd6E02',
    usdc: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52',
    sayStaker: '',
    vesting: '',
    sayAirdrop: '',
  },
};

export enum SupportedChain {
  Arbitrum = 42161,
  FlowEvm = 747,
}

export const supportedChains: Set<SupportedChain> = new Set([
  SupportedChain.Arbitrum,
  SupportedChain.FlowEvm,
]);
