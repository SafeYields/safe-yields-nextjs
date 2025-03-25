export default function Home() {
  return (
    <>
      <div
        id='main-bg'
        className='flex flex-col justify-between px-16 relative w-full h-full'
      >
        <h3 className='scroll-m-20 pt-8 text-3xl font-semibold tracking-tight first:mt-0 max-w-md'>
          Emma AI guides you through selecting optimal yield strategies for{' '}
          <span className='text-[#4CFAC7]'>sustainable growth</span>
        </h3>
        {/* <div className='fixed aspect-[695/692] md:max-w-2xl max-w-lg mx-auto w-full lg:top-1/2 top-3/4 left-1/2 -translate-x-1/2 -translate-y-3/4 lg:-translate-y-1/2'> */}
        <div className='flex items-center justify-center'>
          <Image
            src='/images/hero.png'
            fill
            alt='safeyields character'
            /* sizes='60vw' */
            /* width={600}
            height={600} */
            className='object-contain py-20'
          />
        </div>

        <h3 className='scroll-m-20 pb-8 text-3xl font-semibold tracking-tight first:mt-0 max-w-md self-end w-[350px]'>
          Find <span className='text-brand-1'>consistency</span> in the volatile
          DeFi space.
        </h3>
      </div>
    </>
  );
}
