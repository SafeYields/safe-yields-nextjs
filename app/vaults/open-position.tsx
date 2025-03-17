'use client';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { plutoExposurePaginated$ } from '@/lib/store';
import { For, Memo, Show, use$ } from '@legendapp/state/react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function OpenPosition() {
  return (
    <div className='flex flex-col gap-8'>
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
          <TableContent />
        </TableBody>
      </Table>
      <PaginateTable />
    </div>
  );
}

function TableContent() {
  return (
    <Memo>
      <For each={plutoExposurePaginated$.items} optimized>
        {(item$) => (
          <TableRow className='even:text-brand-2 relative after:bottom-0 after:left-0 after:block after:absolute after:bg-brand-1  after:h-[1px] after:w-full shadow-brand-1 after:shadow-custom'>
            <TableCell className='font-bold'>{item$.pair.get()}</TableCell>
            <TableCell>{item$.exchange.get()}</TableCell>
            <TableCell>
              {currencyFormatter.format(+item$.sizeUsd.get())}
            </TableCell>
            <TableCell>
              {currencyFormatter.format(+item$.currentPrice.get())}
            </TableCell>
            <TableCell>{item$.fundingPnlUsd.get() || 'N/A'}</TableCell>
          </TableRow>
        )}
      </For>
    </Memo>
  );
}

function PaginateTable() {
  const { hasNext, hasPrev, page } = use$(plutoExposurePaginated$);

  return (
    <Pagination className='justify-start'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            isActive={hasPrev}
            disabled={!hasPrev}
            onClick={() => plutoExposurePaginated$.page.set((page) => page - 1)}
          />
        </PaginationItem>
        <Show if={hasPrev && !hasNext}>
          {() => (
            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  plutoExposurePaginated$.page.set((page) => page - 1)
                }
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}
        </Show>
        <PaginationItem>
          <PaginationLink isActive>{page}</PaginationLink>
        </PaginationItem>

        <Show if={hasNext}>
          {() => (
            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  plutoExposurePaginated$.page.set((page) => page + 1)
                }
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}
        </Show>

        <PaginationItem>
          <PaginationNext
            isActive={hasNext}
            disabled={!hasNext}
            onClick={() => plutoExposurePaginated$.page.set((page) => page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
