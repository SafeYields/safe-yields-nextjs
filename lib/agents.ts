import { z } from 'zod';
import { createResource } from './actions/resources';
import { findRelevantContent } from './ai/embedding';
import { tool } from 'ai';
import { tavily } from '@tavily/core';

const AddResourceSchema = z.object({
  content: z
    .string()
    .describe('the content or resource to add to the knowledge base'),
});

type AddResourceInput = z.infer<typeof AddResourceSchema>;

export const addResource = tool({
  description: `add a resource to your knowledge base.
    If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
  parameters: AddResourceSchema,
  execute: async ({ content }: AddResourceInput) => createResource({ content }),
});

const GetInformationSchema = z.object({
  question: z.string().describe('the users question'),
});
type GetInformationInput = z.infer<typeof GetInformationSchema>;

export const getInformation = tool({
  description: `get information from your knowledge base to answer questions.`,
  parameters: GetInformationSchema,
  execute: async ({ question }: GetInformationInput) => {
    return findRelevantContent(question);
  },
});

export const getDate = tool({
  description: 'get the current date to use in search',
  parameters: z.object({}),
  execute: async () =>
    new Promise((resolve) => {
      const utcDate = new Date().toUTCString();
      resolve(utcDate);
    }),
});

export const buildPortfolio = tool({
  description:
    'This function retrieves the cryptocurrency portfolio of the user',
  parameters: z.object({}),
  execute: async () =>
    new Promise((resolve) => {
      resolve(
        'Certainly! Please review and approve the transaction in your wallet to proceed with deploying $1000 into the Delta-Neutral portfolio. Let me know if you need assistance with the process!',
      );
    }),
});

export const tavilyWebSearch = tool({
  description:
    'Searches the web to find the most relevant pages for a given query and summarizes the results. Very useful for finding up-to-date news and information about any topic.',
  parameters: z.object({
    query: z
      .string()
      .describe('The query to search for. Accepts any Google search query.'),
    search_depth: z
      .enum(['basic', 'advanced'])
      .optional()
      .describe(
        'How deep of a search to perform. Use "basic" for quick results and "advanced" for slower, in-depth results.',
      ),
    include_answer: z
      .boolean()
      .optional()
      .describe('Whether or not to include an answer summary in the results.'),
    include_images: z
      .boolean()
      .optional()
      .describe('Whether or not to include images in the results.'),
    max_results: z
      .number()
      .int()
      .positive()
      .default(5)
      .optional()
      .describe('Max number of search results to return.'),
  }),
  execute: async ({ query, ...args }) => {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    return await tvly.search(query, args);
  },
});
