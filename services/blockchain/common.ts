import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { ethers } from 'ethers';
import airdrop from './constants/airdrop.json';
import { Erc20Abi } from './types';

export const getAllowance = async (
  contract: Erc20Abi,
  owner: string,
  spender: string,
) => {
  try {
    return await contract.allowance(owner, spender);
  } catch (_) {
    return BigInt(0);
  }
};

export const approveSpending = async (
  contract: Erc20Abi,
  spender: string,
  amount: bigint,
) => {
  try {
    const tx = await contract.approve(spender, amount);
    const txResponse = await tx.wait();
    return txResponse!.hash;
  } catch (_) {
    console.error('error approving spending: ', _);
    return '';
  }
};

export const getUserAirdropAmount = (
  address: string,
): { address: string; amount: number } | undefined => {
  return airdrop.find(
    (data) => ethers.getAddress(data.address) === ethers.getAddress(address),
  );
};

export const getMerkleProof = (address: string) => {
  // Convert file data into whitelist
  const whitelist = airdrop.map((data) => {
    const { address, amount } = data;
    const convertedAmount = ethers.parseEther(amount.toString()).toString();

    return [ethers.getAddress(address), convertedAmount];
  });

  const tree = StandardMerkleTree.of(whitelist, ['address', 'uint256']);
  console.log('root: ', tree.root);
  //console.log("Merkle tree: ", JSON.stringify(tree.dump(), null, 2));

  for (const [i, v] of tree.entries()) {
    if (v[0] === address)
      return { amount: BigInt(v[1]), proof: tree.getProof(i) };
  }
  return { amount: BigInt(0), proof: [] };
};
