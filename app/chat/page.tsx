'use client';

import {
  AssistantRuntimeProvider,
  WebSpeechSynthesisAdapter,
  makeAssistantToolUI,
} from '@assistant-ui/react';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@/components/assistant-ui/thread';
import { ThreadList } from '@/components/assistant-ui/thread-list';
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from '@assistant-ui/react';
import { Button } from '@/components/ui/button';

const BuildPortfolioToolUI = makeAssistantToolUI({
  toolName: 'buildPortfolio',
  render: ({}) => {
    window.open('/portfolio', '_blank', 'noopener,noreferrer');
    return (
      <Button
        onClick={() =>
          window.open('/portfolio', '_blank', 'noopener,noreferrer')
        }
      >
        Open
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
      <div className='grid h-full grid-cols-[5fr_1fr] gap-2'>
        <BuildPortfolioToolUI />
        <Thread />
        <ThreadList />
      </div>
    </AssistantRuntimeProvider>
  );
}
