import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className='flex flex-col justify-between px-16 relative w-full h-[85%]'>
        <h3 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-md'>
          Emma AI guides you through selecting optimal yield strategies for{' '}
          <span className='text-brand-1'>sustainable growth</span>
        </h3>
        <div className='fixed aspect-[695/692] md:max-w-2xl max-w-lg mx-auto w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <Image
            src='/images/hero.png'
            fill
            alt='safeyields character'
            sizes='60vw'
            className='object-contain h-full w-full'
          />  
        </div>

        <h3 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-md self-end'>
          Find <span className='text-brand-1'>consistency</span> in the volatile
          DeFi space.
        </h3>
      </div>
    </>
  );
}
