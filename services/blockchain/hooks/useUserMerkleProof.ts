import { useEffect, useState } from 'react';
import { getMerkleProof } from '../common';

const useUserMerkleProof = (address: string) => {
  const [merkleProof, setMerkleProof] = useState<{
    amount: BigInt;
    proof: string[];
  } | null>(null);
  useEffect(() => {
    const userMerkleProof = async () => {
      const data = getMerkleProof(address);
      setMerkleProof(data);
    };

    userMerkleProof();
  }, [address]);

  return { merkleProof };
};

export { useUserMerkleProof };
