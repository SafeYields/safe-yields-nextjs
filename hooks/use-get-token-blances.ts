'use client';
import useEthersProvider from '@/services/blockchain/hooks/useEthersProvider';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

export default function useGetTokenBalances(address: string, txUpdate: number) {
  const provider = useEthersProvider();
  const { usdc } = useSafeYieldsContract();

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [safeBalance, setSafeBalance] = useState(0);
  const [stakedSafe, setStakedSafe] = useState(0);

  useEffect(() => {
    if (!provider || !address) return;

    const getBalances = async () => {
      try {
        // const SAFE_CONTRACT_ = SAFE_CONTRACT.connect(provider) as Contract;

        const usdcBalance_ = await usdc.balanceOf(address);
        setUsdcBalance(Number(ethers.formatUnits(usdcBalance_, 6)));
      } catch (err) {}
    };

    getBalances();
  }, [provider, address, txUpdate]);

  return { usdcBalance, safeBalance, stakedSafe };
}
