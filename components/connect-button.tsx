import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';

export default function ConnectButton() {
  return (
    <RainbowKitConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105 bg-[#4CFAC7]'
            >
              Connect Wallet
            </Button>
          );
        }

        return (
          <div className='flex items-center space-x-2'>
            <Button
              onClick={openChainModal}
              type='button'
              variant='ghost'
              className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105 border-2 border-[#4CFAC7]'
            >
              {account.displayName}
            </Button>
          </div>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}
