import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { SupportedChain } from '../constants/addresses';
import { useSafeYieldsContract } from '../safeyields.contracts';

export const useGetVaultData = (
  chainId: SupportedChain | undefined,
  address: string | undefined,
  performanceData: any,
) => {
  const { emmaVault } = useSafeYieldsContract();

  const [vaultData, setVaultData] = useState({
    userShares: '0',
    totalShares: '0',
    userEquity: '0',
    userPnl: '0',
  });

  useEffect(() => {
    if (!chainId || !address) return;
    const userSharesRequest = emmaVault.balanceOf(address);
    const totalShares = emmaVault.totalSupply();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise.allSettled([userSharesRequest, totalShares]).then(
      (results: any) => {
        console.log('results: ', results);
        console.log('user shares: ', results[0].value);
        console.log('total shares: ', results[1].value);
        const parsedUserShare = +ethers.formatUnits(results[0].value);
        const parsedTotalShares = +ethers.formatUnits(results[1].value);
        if (!performanceData) return vaultData;
        const userEquity =
          (parsedUserShare * +performanceData.equity) / parsedTotalShares;
        console.log('user equity: ', userEquity);
        const userPnl =
          ((+performanceData.pnl + +performanceData.unrealizedPnl) *
            parsedUserShare) /
          parsedTotalShares;

        setVaultData({
          userShares: parsedUserShare.toFixed(3),
          totalShares: parsedTotalShares.toFixed(3),
          userEquity: userEquity.toFixed(3),
          userPnl: userPnl.toFixed(3),
        });
      },
    );
    /**
         * {
    "updateTime": "2025-02-14T13:00:00.431591Z",
    "updateReason": "SCHEDULED",
    "initialBalance": "25000.00000000",
    "equity": "24972.04747868",
    "unrealizedPnl": "-5.22329402",
    "unrealizedPnlPerc": "-0.02089318",
    "pnl": "-13.89960726",
    "pnlPerc": "1.29372026"
}
         */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, emmaVault, performanceData]);

  return vaultData;
};
