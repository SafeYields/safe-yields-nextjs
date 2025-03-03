import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className='flex items-start justify-start mt-16 px-16 relative min-h-[80vh] w-full gap-16'>
        <h3 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-md'>
          Emma AI guides you through selecting optimal yield strategies for{' '}
          <span className='text-[#4CFAC7]'>sustainable growth</span>
        </h3>
        <Image
          src='/images/hero.png'
          width='695'
          height='692'
          alt='safeyields character'
          className='inline-block absolute left-56 top-4'
        />
        <h3 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-md self-end'>
          Find <span className='text-[#4CFAC7]'>consistency</span> in the
          volatile DeFi space.
        </h3>
      </div>
    </>
  );
}
