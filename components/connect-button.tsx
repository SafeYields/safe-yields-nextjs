import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';

export default function ConnectButton() {
  return (
    <RainbowKitConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105'
            >
              Connect Wallet
            </Button>
          );
        }

        // If connected, show the chain name, avatar, or address, etc.
        return (
          <div className='flex items-center space-x-2'>
            <Button
              onClick={openAccountModal}
              type='button'
              className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105'
            >
              {account.displayName}
            </Button>
          </div>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}
