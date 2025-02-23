'use client';
import { USDC_CONTRACT } from '@/constants/contracts/contracts';
import useEthersProvider from '@/services/blockchain/hooks/useEthersProvider';
import { Contract, ethers } from 'ethers';
import { useEffect, useState } from 'react';

export default function useGetTokenBalances(address: string, txUpdate: number) {
  const provider = useEthersProvider();

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [safeBalance, setSafeBalance] = useState(0);
  const [stakedSafe, setStakedSafe] = useState(0);

  useEffect(() => {
    if (!provider || !address) return;

    const getBalances = async () => {
      try {
        const USDC_CONTRACT_ = USDC_CONTRACT.connect(provider) as Contract;
        // const SAFE_CONTRACT_ = SAFE_CONTRACT.connect(provider) as Contract;

        const usdcBalance_ = await USDC_CONTRACT_.balanceOf(address);
        console.log(usdcBalance_);
        setUsdcBalance(Number(ethers.formatUnits(usdcBalance_, 6)));
      } catch (err) {}
    };

    getBalances();
  }, [provider, address, txUpdate]);

  return { usdcBalance, safeBalance, stakedSafe };
}
