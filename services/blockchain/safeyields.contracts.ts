import { ContractRunner } from 'ethers';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import {
  addresses,
  SupportedChain,
  supportedChains,
} from './constants/addresses';
import useEthersProvider from './hooks/useEthersProvider';
import {
  EmmaVaultAbi__factory,
  Erc20Abi__factory,
  SayAirdrop__factory,
  SayStakerAbi__factory,
  SayVestingAbi__factory,
} from './types';

export const useSafeYieldsContract = (optionalRunner?: ContractRunner) => {
  const { chainId } = useAccount();
  const provider = useEthersProvider();

  const runner = optionalRunner ?? provider;

  const validChainId = supportedChains.has(chainId ?? 0)
    ? (chainId as SupportedChain)
    : SupportedChain.Arbitrum;

  const { emmaVault, usdc, sayStaker, vesting, sayAirdrop } =
    addresses[validChainId];
  //NB: Flow does not have a sayStaker, vesting contract or a sayAirdrop contract
  return useMemo(
    () => ({
      emmaVault: EmmaVaultAbi__factory.connect(emmaVault, runner),
      usdc: Erc20Abi__factory.connect(usdc, runner),
      sayStaker: SayStakerAbi__factory.connect(sayStaker, runner),
      sayVesting: SayVestingAbi__factory.connect(vesting, runner),
      sayAirdrop: SayAirdrop__factory.connect(sayAirdrop, runner),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, runner],
  );
};
