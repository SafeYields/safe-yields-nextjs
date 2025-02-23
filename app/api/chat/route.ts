import {
  addResource,
  buildPortfolio,
  getDate,
  getInformation,
  tavilyWebSearch,
} from '@/lib/agents';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system: `
      1. Get the current date for reference.
      2. Search for [specific topic or information].
      3. Summarize the findings, including:
        - Key details
        - Relevant statistics
        - Your opinion on the topic based on the information gathered.
      4. Verify the information with additional sources if necessary.
      5. Present the summary in a clear and concise format.
      
      When asked about building a portfolio, respond with:
      "Currently, SafeYields can provide a Delta-Neutral funding rate portfolio only, but more strategies are coming soon. A Delta-Neutral Arbitrage strategy is ideal for conservative users, historically yielding between 50%-80% APR. How much would you like to deploy in USDC to this portfolio?"
      
      If the user specifies an amount (e.g., $100), then call the tool buildPortfolio.
  `,
    messages: messages,
    maxSteps: 5,
    tools: {
      getDate,
      getInformation,
      addResource,
      buildPortfolio,
      tavilyWebSearch,
    },
  });

  return result.toDataStreamResponse();
}
