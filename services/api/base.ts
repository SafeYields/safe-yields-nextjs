import axios from 'axios';
import { SupportedChain } from '../blockchain/constants/addresses';

const endPoints = {
  42161: 'https://trading-data.alphacube.io:8086/api/v1/history',
  747: 'https://trading-data.alphacube.io:8085/api/v1/history',
};

export const getTradeData = async (chainId: SupportedChain) => {
  try {
    const response = await axios.get(endPoints[chainId]);
    //console.log('response: ', response);
    return response.data;
  } catch (err) {
    console.error('error getting trade data', err);
    return {};
  }
};
