import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';

export default function ConnectButton() {
  return (
    <>
      <RainbowKitConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted, openAccountModal }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          if (!connected) {
            return (
              <Button
                onClick={openConnectModal}
                className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105 bg-brand-1'
              >
                Connect Wallet
              </Button>
            );
          }

          return (
            <div className='flex items-center space-x-2'>
              <Button
                onClick={openAccountModal}
                type='button'
                variant='ghost'
                className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105 border-2 border-brand-1'
              >
                {account.displayName}
              </Button>
            </div>
          );
        }}
      </RainbowKitConnectButton.Custom>
    </>
  );
}
