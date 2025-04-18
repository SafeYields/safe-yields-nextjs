'use client';

import { Thread } from '@/components/assistant-ui/thread';
import { ThreadList } from '@/components/assistant-ui/thread-list';
import { Button } from '@/components/ui/button';
import {
  AssistantRuntimeProvider,
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  WebSpeechSynthesisAdapter,
  makeAssistantToolUI,
} from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';

const BuildPortfolioToolUI = makeAssistantToolUI({
  toolName: 'buildPortfolio',
  render: ({}) => {
    window.open('/vaults', '_blank', 'noopener,noreferrer');
    return (
      <Button
        className='bg-brand-2 text-white px-4 py-0 rounded-xl'
        onClick={() => window.open('/vaults', '_blank', 'noopener,noreferrer')}
      >
        Click here to deposit
      </Button>
    );
  },
});

export default function Chat() {
  const runtime = useChatRuntime({
    api: '/api/chat',
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='flex flex-row w-full h-full'>
        <div className='chat-threadList sticky top-0 overflow-y-auto w-[300px]'>
          <ThreadList />
        </div>
        <div className='bg-[#27272a] w-[1px]'></div>
        <div className='w-full'>
          <BuildPortfolioToolUI />
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
