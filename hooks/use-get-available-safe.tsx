'use client';

import { useEffect, useState } from 'react';
import { SAFE_CONTRACT } from '@/constants/contracts/contracts';
import { ethers } from 'ethers';
import { Contract } from 'ethers';
import useEthersProvider from '@/services/blockchain/hooks/useEthersProvider';

export default function useGetAvailableSafe(address: string, txUpdate: number) {
  const provider = useEthersProvider();
  const [stakedSafe, setStakedSafe] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);

  useEffect(() => {
    if (!provider || !address) return;

    const getBalances = async () => {
      try {
        const SAFE_CONTRACT_ = SAFE_CONTRACT.connect(provider) as Contract;
        const safeBalance_ = await SAFE_CONTRACT_.investorAllocations(address);
        const totalSold_ = await SAFE_CONTRACT_.totalSold();
        const tokenPrice_ = await SAFE_CONTRACT_.tokenPrice();

        setStakedSafe(parseFloat(ethers.formatEther(safeBalance_)));
        setTotalSold(parseFloat(ethers.formatEther(totalSold_)));
        setTokenPrice(parseFloat(ethers.formatEther(tokenPrice_)));

        console.log(totalSold, tokenPrice, stakedSafe);
      } catch (err) {
        console.log(err);
      }
    };

    getBalances();
  }, [provider, address, txUpdate]);

  return { stakedSafe, totalSold, tokenPrice };
}
