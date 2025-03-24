import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { plutoTradingHistroy$, totalLockedValue$ } from '@/lib/store';
import { Show, use$ } from '@legendapp/state/react';

export default function Info() {
  const data = use$(plutoTradingHistroy$);
  const totalValueLocked = use$(totalLockedValue$);

  const formatTotalValueLocked = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  };

  return (
    <>
      <h3 className='scroll-m-20 text-xl font-semibold tracking-tight flex items-center gap-2'>
        <div>
          <svg
            width='22'
            height='22'
            viewBox='0 0 22 22'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle cx='10' cy='13' r='9' fill='#9999FF' />
            <path
              d='M9.05021 8.01215L7.85239 5.40356C5.21718 10.674 2.60859 15.9178 0 21.1882C0.77193 21.1882 1.464 21.2148 2.15608 21.1882C2.28917 21.1882 2.50212 21.0551 2.58197 20.922C3.11434 19.8839 3.62008 18.8458 4.15245 17.8077C5.74955 14.5869 7.37326 11.3927 8.97036 8.17186C8.97036 8.09201 9.02359 8.06539 9.05021 8.01215Z'
              fill='#F2ECE4'
            />
            <path
              d='M13.9744 18.8457C13.8146 18.8457 13.6816 18.8457 13.5485 18.8457C11.073 18.8457 8.59747 18.8191 6.12197 18.8191C5.93564 18.8191 5.64284 18.9522 5.56299 19.1119C5.21695 19.7773 4.95077 20.4428 4.63135 21.2414C8.11834 21.2414 11.5787 21.2414 15.0657 21.2414L13.9744 18.8457Z'
              fill='#F2ECE4'
            />
            <path
              d='M7.98535 5.03085L10.5407 0L21.1614 21.1349L15.332 21.0817L7.98535 5.03085Z'
              fill='#F2ECE4'
            />
          </svg>
        </div>
        Delta Neutral Funding Rate Arbitrage
      </h3>
      <p className='leading-7 [&:not(:first-child)]:mt-6 text-base'>
        Unlock potential with our Delta-neutral Funding Rate Arbitrage strategy,
        designed to exploit funding rate differentials across exchanges, while
        maintaining a neutral position in the market.
      </p>
      <ul className='my-6 ml-6 list-disc [&>li]:mt-2'>
        <li>
          <span className='font-bold'>Automatic Adjustments:</span> Responds
          dynamically to market changes to ensure optimal positioning.
        </li>
        <li>
          <span className='font-bold'>Data-Driven Decisions:</span> Uses
          real-time market data for enhanced decision-making on entries and
          exits.
        </li>
        <li>
          <span className='font-bold'>Enhanced Risk Management:</span> Employs
          stringent risk controls to mitigate exposure and enhance security.
        </li>
      </ul>
      <p className='leading-7 [&:not(:first-child)]:mt-6'>
        This strategy integrates advanced trading techniques with straightforward
        execution, providing a reliable tool for{' '}
        <span className='text-brand-2 font-bold '>
          diversifying your portfolio
        </span>{' '}
        and{' '}
        <span className='text-brand-2 font-bold'>
          achieving consistent returns.
        </span>
      </p>
      <div className='flex flex-col md:flex-row mt-4 md:h-20 max-h-fit w-full items-center gap-4'>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] hidden md:block shadow-custom'
        />
        <div className='flex flex-col justify-center items-center gap-2 flex-1 py-2 min-w-max w-44'>
          <div className='flex flex-row gap-4 relative'>
            <span className='font-medium text-xs'>Average APY</span>
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild className='absolute -right-5 bottom-3'>
                <svg
                  width='11'
                  height='11'
                  viewBox='0 0 11 11'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M0.5 5.5C0.5 2.73858 2.73858 0.5 5.5 0.5C8.26142 0.5 10.5 2.73858 10.5 5.5C10.5 8.26142 8.26142 10.5 5.5 10.5H0.5V5.5Z'
                    stroke='#F2ECE4'
                  />
                  <path
                    d='M6.17772 2.57294C6.17772 2.7321 6.11406 2.87533 6.00265 3.00265C5.89125 3.11406 5.74801 3.17772 5.58886 3.17772C5.50928 3.17772 5.44562 3.1618 5.36605 3.12997C5.30239 3.09814 5.23873 3.0504 5.17507 3.00265C5.12732 2.95491 5.07958 2.89125 5.04775 2.81167C5.01592 2.7321 5 2.66843 5 2.57294C5 2.49337 5.01592 2.42971 5.04775 2.36605C5.07958 2.30239 5.12732 2.23873 5.17507 2.17507C5.22281 2.12732 5.28647 2.07958 5.36605 2.04775C5.42971 2.01591 5.50928 2 5.58886 2C5.66844 2 5.7321 2.01591 5.81167 2.04775C5.87533 2.07958 5.93899 2.12732 6.00265 2.17507C6.06631 2.22281 6.09814 2.28647 6.12997 2.35013C6.1618 2.41379 6.17772 2.49337 6.17772 2.57294ZM6.11406 7.42706C6.11406 7.60212 6.06631 7.74536 5.97082 7.84085C5.87533 7.95225 5.74801 8 5.58886 8C5.42971 8 5.30239 7.95225 5.2069 7.84085C5.11141 7.72944 5.06366 7.60212 5.06366 7.42706V4.56233C5.06366 4.38727 5.11141 4.24403 5.2069 4.14854C5.30239 4.03714 5.42971 3.98939 5.58886 3.98939C5.74801 3.98939 5.87533 4.03714 5.97082 4.14854C6.06631 4.25995 6.11406 4.38727 6.11406 4.56233V7.42706Z'
                    fill='#F2ECE4'
                  />
                </svg>
              </HoverCardTrigger>
              <HoverCardContent
                align='start'
                className='bg-[#F2ECE4] text-xs text-black rounded-e-3xl rounded-b-3xl'
              >
                Represents the rate of return over a year, accounting for the
                effect of compounding interest and it&apos;s calculated from all
                time historical data.
              </HoverCardContent>
            </HoverCard>
          </div>
          <span className='font-bold text-brand-1 text-lg'>
            <Show ifReady={data}>{() => data!.apy.toFixed(2)}</Show>%
          </span>
        </div>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] shadow-custom'
        />

        <div className='flex flex-col justify-center items-center gap-2 flex-1 py-2 min-w-max w-44'>
          <span className='font-medium text-xs'>Total Value Locked</span>
          <span className='font-bold text-brand-1 text-lg'>
            <Show ifReady={totalValueLocked}>
              {totalValueLocked.value
                ? formatTotalValueLocked(totalValueLocked.value)
                : '...'}
            </Show>
          </span>
        </div>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] shadow-custom'
        />
        <div className='flex flex-col justify-center items-center gap-2 flex-1 py-2 min-w-max w-44'>
          <div className='flex flex-row gap-4 relative'>
            <span className='font-medium text-xs'>
              Historical Max. Downdrawn
            </span>
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild className='absolute -right-5 bottom-3'>
                <svg
                  width='11'
                  height='11'
                  viewBox='0 0 11 11'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M0.5 5.5C0.5 2.73858 2.73858 0.5 5.5 0.5C8.26142 0.5 10.5 2.73858 10.5 5.5C10.5 8.26142 8.26142 10.5 5.5 10.5H0.5V5.5Z'
                    stroke='#F2ECE4'
                  />
                  <path
                    d='M6.17772 2.57294C6.17772 2.7321 6.11406 2.87533 6.00265 3.00265C5.89125 3.11406 5.74801 3.17772 5.58886 3.17772C5.50928 3.17772 5.44562 3.1618 5.36605 3.12997C5.30239 3.09814 5.23873 3.0504 5.17507 3.00265C5.12732 2.95491 5.07958 2.89125 5.04775 2.81167C5.01592 2.7321 5 2.66843 5 2.57294C5 2.49337 5.01592 2.42971 5.04775 2.36605C5.07958 2.30239 5.12732 2.23873 5.17507 2.17507C5.22281 2.12732 5.28647 2.07958 5.36605 2.04775C5.42971 2.01591 5.50928 2 5.58886 2C5.66844 2 5.7321 2.01591 5.81167 2.04775C5.87533 2.07958 5.93899 2.12732 6.00265 2.17507C6.06631 2.22281 6.09814 2.28647 6.12997 2.35013C6.1618 2.41379 6.17772 2.49337 6.17772 2.57294ZM6.11406 7.42706C6.11406 7.60212 6.06631 7.74536 5.97082 7.84085C5.87533 7.95225 5.74801 8 5.58886 8C5.42971 8 5.30239 7.95225 5.2069 7.84085C5.11141 7.72944 5.06366 7.60212 5.06366 7.42706V4.56233C5.06366 4.38727 5.11141 4.24403 5.2069 4.14854C5.30239 4.03714 5.42971 3.98939 5.58886 3.98939C5.74801 3.98939 5.87533 4.03714 5.97082 4.14854C6.06631 4.25995 6.11406 4.38727 6.11406 4.56233V7.42706Z'
                    fill='#F2ECE4'
                  />
                </svg>
              </HoverCardTrigger>
              <HoverCardContent
                align='end'
                className='bg-[#F2ECE4] text-xs text-black rounded-s-3xl rounded-b-3xl'
              >
                Measures the largest single drop from peak to through,
                indicating the highest potential loss.
              </HoverCardContent>
            </HoverCard>
          </div>
          <span className='font-bold text-brand-1 text-lg'>
            <Show ifReady={data}>{() => data!.max_drawdown.toFixed(2)}</Show>%
          </span>
        </div>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] hidden md:block shadow-custom'
        />
      </div>
    </>
  );
}
