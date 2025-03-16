'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Exposure, plutoExposure$ } from '@/lib/store';
import { type Observable } from '@legendapp/state';
import { For } from '@legendapp/state/react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function Row({ item$ }: { item$: Observable<Exposure> }) {
  return (
    <TableRow className='even:text-brand-2 relative after:bottom-0 after:left-0 after:block after:absolute after:bg-brand-1  after:h-[1px] after:w-full shadow-brand-1 after:shadow-custom'>
      <TableCell className='font-bold'>{item$.pair.get()}</TableCell>
      <TableCell>{item$.exchange.get()}</TableCell>
      <TableCell>{currencyFormatter.format(+item$.sizeUsd.get())}</TableCell>
      <TableCell>
        {currencyFormatter.format(+item$.currentPrice.get())}
      </TableCell>
      <TableCell>{item$.fundingPnlUsd.get() || 'N/A'}</TableCell>
    </TableRow>
  );
}

export default function OpenPosition() {
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
        <For each={plutoExposure$} item={Row} />
      </TableBody>
    </Table>
  );
}
