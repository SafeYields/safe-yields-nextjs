import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { SupportedChain } from '../constants/addresses';
import { useSafeYieldsContract } from '../safeyields.contracts';

export const useGetVaultData = (
  chainId: SupportedChain | undefined,
  address: string | undefined,
  performanceData: any,
) => {
  const { emmaVault, usdc } = useSafeYieldsContract();

  const [vaultData, setVaultData] = useState({
    userShares: '0',
    totalShares: '0',
    userEquity: '0',
    userPnl: '0',
    vaultUdcBalance: '0',
  });

  useEffect(() => {
    if (!chainId || !address) return;
    const userSharesRequest = emmaVault.balanceOf(address);
    const totalShares = emmaVault.totalSupply();
    const vaultUsdcBalanceRequest = usdc.balanceOf(emmaVault.getAddress());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise.allSettled([userSharesRequest, totalShares, vaultUsdcBalanceRequest]).then(
      (results: any) => {
        const parsedUserShare = +ethers.formatUnits(results[0].value);
        const parsedTotalShares = +ethers.formatUnits(results[1].value);
        const vaultUsdcBalance = +ethers.formatUnits(results[2].value);

        // if (!performanceData) {
        //   setVaultData({...vaultData, vaultUdcBalance: vaultUsdcBalance.toFixed(3)});
        //   return;
        // }
        const totalEquity = parseFloat(performanceData.equity || '0') + vaultUsdcBalance;
        const userEquity =
          (parsedUserShare * totalEquity ) / parsedTotalShares;
        
        const userPnl =
          ((+performanceData.pnl + +performanceData.unrealizedPnl) *
            parsedUserShare) /
          parsedTotalShares;

        setVaultData({
          userShares: parsedUserShare.toFixed(3),
          totalShares: parsedTotalShares.toFixed(3),
          userEquity: userEquity.toFixed(3),
          userPnl: userPnl.toFixed(3),
          vaultUdcBalance: vaultUsdcBalance.toFixed(3),
        });
      },
    );
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, emmaVault, performanceData]);

  return vaultData;
};
