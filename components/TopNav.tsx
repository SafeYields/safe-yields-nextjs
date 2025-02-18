// import ConnectButton from "./buttons/ConnectButton";
import { ConnectButton } from '@rainbow-me/rainbowkit';
// import PrimaryButton from "./buttons/PrimaryButton"
import { Button } from './ui/button';
// import { useWeb3ModalAccount } from "@web3modal/ethers/react";

const TopNav = () => {
  // const { isConnected, address } = useWeb3ModalAccount();
  /* const { address } = useAccount()
    const { usdcBalance } = useGetTokenBalances(address!, 1) */
  return (
    <nav className='fixed left-0 right-0 top-0 z-20 mt-8 h-auto px-4 py-4 md:ml-[22rem]'>
      <div className='flex flex-col items-end justify-end space-x-6 space-y-2 pr-20'>
        <div className='flex space-x-6'>
          <Button className='mr-6 bg-transparent text-base font-bold text-white hover:bg-transparent hover:text-[#4CFAC7]'>
            <span>Whitepaper</span>
          </Button>
          <Button className='mr-6 bg-transparent text-base font-bold text-white hover:bg-transparent hover:text-[#4CFAC7]'>
            <span>Buy SAFE</span>
          </Button>

          <ConnectButton />
        </div>
        <span className="font-['Space Grotesk'] pr-2 text-[15px] font-normal text-white/70"></span>
      </div>
    </nav>
  );
};

export default TopNav;
