import { useEffect, useState } from 'react';
import { getTradeData } from '../base';
import { SupportedChain } from '@/services/blockchain/constants/addresses';

export const useGetDashboardData = (chainId: SupportedChain | undefined) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>({});

  useEffect(() => {
    if (!chainId) return;
    getTradeData(chainId).then((data) => {
      setData(data);
    });
  }, [chainId]);

  return data;
};
