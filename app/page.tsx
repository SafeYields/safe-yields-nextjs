import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className='flex flex-col md:flex-row items-start justify-between mt-16 px-16 relative min-h-[80vh] w-full gap-16'>
        <h3 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-md'>
          Emma AI guides you through selecting optimal yield strategies for{' '}
          <span className='text-brand-1'>sustainable growth</span>
        </h3>
        <Image
          src='/images/hero.png'
          width='695'
          height='692'
          alt='safeyields character'
          className='inline-block md:absolute inline-block left-1/2 md:-translate-x-1/2 top-4'
        />
        <h3 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-md self-end'>
          Find <span className='text-brand-1'>consistency</span> in the volatile
          DeFi space.
        </h3>
      </div>
    </>
  );
}
