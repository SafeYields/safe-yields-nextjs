import { cn } from '@/lib/utils';
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react';
import {
  ArrowDownIcon,
  AudioLinesIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  StopCircleIcon,
} from 'lucide-react';
import type { FC } from 'react';

import { MarkdownText } from '@/components/assistant-ui/markdown-text';
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollBar } from '@/components/ui/scroll-area';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from './attachment';

export const Thread: FC = () => {
  return (
    <ScrollAreaPrimitive.Root asChild>
      <ThreadPrimitive.Root
        className='box-border h-full'
        style={{
          ['--thread-max-width' as string]: '42rem',
        }}
      >
        <ScrollAreaPrimitive.Viewport
          className='thread-viewport h-full'
          asChild
        >
          <ThreadPrimitive.Viewport className='no-scrollbar flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8'>
            <ThreadWelcome />

            <ThreadPrimitive.Messages
              components={{
                UserMessage: UserMessage,
                EditComposer: EditComposer,
                AssistantMessage: AssistantMessage,
              }}
            />

            <ThreadPrimitive.If empty={false}>
              <div className='min-h-8 flex-grow' />
            </ThreadPrimitive.If>
            
            <div className='sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4'>
              <ThreadScrollToBottom />
              <Composer />
            </div>
          </ThreadPrimitive.Viewport>
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
      </ThreadPrimitive.Root>
    </ScrollAreaPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip='Scroll to bottom'
        variant='outline'
        className='absolute -top-8 rounded-full disabled:invisible'
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className='flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col'>
        <div className='flex w-full flex-grow flex-col items-center justify-center'>
          <Avatar>
            <AvatarImage src='/images/logo.svg' />
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
          <p className='mt-4 font-medium'>How can I help you today?</p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className='mt-3 flex w-full items-stretch justify-center gap-4'>
      <ThreadPrimitive.Suggestion
        className='flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in hover:bg-muted/80'
        prompt='Which strategies can i use to build my SafeYields portfolio?'
        method='replace'
        autoSend
      >
        <span className='line-clamp-2 text-ellipsis text-sm font-semibold'>
          Which strategies can i use to build my SafeYields portfolio?
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className='flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in hover:bg-muted/80'
        prompt="What's the latest performance of SafeYields strategies?"
        method='replace'
        autoSend
      >
        <span className='line-clamp-2 text-ellipsis text-sm font-semibold'>
          What&apos;s the latest performance of SafeYields strategies?
        </span>
      </ThreadPrimitive.Suggestion>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className='flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in focus-within:border-ring/20 bg-[#162728]'>
      <ComposerAttachments />
      <ComposerAddAttachment />
      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder='Write a message...'
        className='max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed'
      />
      <ComposerAction />
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip='Send'
            variant='default'
            className='my-2.5 size-8 p-2 transition-opacity ease-in bg-transparent cursor-pointer'
          >
            <SendHorizontalIcon className='fill-white stroke-white' />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip='Cancel'
            variant='default'
            className='my-2.5 size-8 p-2 transition-opacity ease-in'
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className='grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 py-4 [&>*]:col-start-2'>
      <UserActionBar />
      <UserMessageAttachments />
      <div className='col-start-2 row-start-2 max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl bg-muted px-5 py-2.5 text-foreground'>
        <MessagePrimitive.Content />
      </div>

      <BranchPicker className='col-span-full col-start-1 row-start-3 -mr-1 justify-end' />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide='not-last'
      className='col-start-1 row-start-2 mr-3 mt-2.5 flex flex-col items-end'
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip='Edit'>
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className='my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl bg-muted'>
      <ComposerPrimitive.Input className='flex h-8 w-full resize-none bg-transparent p-4 pb-0 text-foreground outline-none' />

      <div className='mx-3 mb-3 flex items-center justify-center gap-2 self-end'>
        <ComposerPrimitive.Cancel asChild>
          <Button variant='ghost'>Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className='relative grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4'>
      <Avatar className='col-start-1 row-span-full row-start-1 mr-4'>
        <AvatarImage src='/images/logo.svg' />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      <div className='col-span-2 col-start-2 row-start-1 my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 text-foreground'>
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>

      <AssistantActionBar />

      <BranchPicker className='col-start-2 row-start-2 -ml-2 mr-2' />
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide='not-last'
      autohideFloat='single-branch'
      className='col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground'
    >
      <MessagePrimitive.If speaking={false}>
        <ActionBarPrimitive.Speak asChild>
          <TooltipIconButton tooltip='Read aloud'>
            <AudioLinesIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.Speak>
      </MessagePrimitive.If>
      <MessagePrimitive.If speaking>
        <ActionBarPrimitive.StopSpeaking asChild>
          <TooltipIconButton tooltip='Stop'>
            <StopCircleIcon />
          </TooltipIconButton>
        </ActionBarPrimitive.StopSpeaking>
      </MessagePrimitive.If>
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip='Copy'>
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip='Refresh'>
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        'inline-flex items-center text-xs text-muted-foreground',
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip='Previous'>
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className='font-medium'>
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip='Next'>
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 16 16'
      fill='currentColor'
      width='16'
      height='16'
    >
      <rect width='10' height='10' x='3' y='3' rx='2' />
    </svg>
  );
};
