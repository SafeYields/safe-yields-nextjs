import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exposure$ } from '@/lib/store';
import { Show, use$ } from '@legendapp/state/react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function OpenPosition() {
  const exposure = use$(exposure$);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pair</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Size USD</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Funding Pnl</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <Show ifReady={exposure}>
          {exposure!.exposures.map((position, idx) => (
            <>
              <TableRow
                key={`${idx}-${position.pair}`}
                className='even:text-brand-2 relative after:bottom-0 after:left-0 after:block after:absolute after:bg-brand-1  after:h-[1px] after:w-full shadow-brand-1 after:shadow-custom'
              >
                <TableCell className='font-bold'>{position.pair}</TableCell>
                <TableCell>{position.exchange}</TableCell>
                <TableCell>
                  {currencyFormatter.format(+position.sizeUsd)}
                </TableCell>
                <TableCell>
                  {currencyFormatter.format(+position.currentPrice)}
                </TableCell>
                <TableCell>{position.fundingPnlUsd || 'N/A'}</TableCell>
              </TableRow>
            </>
          ))}
        </Show>
      </TableBody>
    </Table>
  );
}
