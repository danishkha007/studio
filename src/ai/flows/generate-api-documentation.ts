'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating API documentation using GenAI.
 *
 * - generateApiDocumentation - A function that generates API documentation based on provided API configurations.
 * - GenerateApiDocumentationInput - The input type for the generateApiDocumentation function.
 * - GenerateApiDocumentationOutput - The return type for the generateApiDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApiDocumentationInputSchema = z.object({
  apiConfig: z.string().describe('The JSON configuration for the API endpoint.'),
});
export type GenerateApiDocumentationInput = z.infer<typeof GenerateApiDocumentationInputSchema>;

const GenerateApiDocumentationOutputSchema = z.object({
  documentation: z.string().describe('The generated API documentation in markdown format.'),
});
export type GenerateApiDocumentationOutput = z.infer<typeof GenerateApiDocumentationOutputSchema>;

export async function generateApiDocumentation(input: GenerateApiDocumentationInput): Promise<GenerateApiDocumentationOutput> {
  return generateApiDocumentationFlow(input);
}

const generateApiDocumentationPrompt = ai.definePrompt({
  name: 'generateApiDocumentationPrompt',
  input: {schema: GenerateApiDocumentationInputSchema},
  output: {schema: GenerateApiDocumentationOutputSchema},
  prompt: `You are an AI documentation generator. Based on the provided API configuration, generate clear and concise API documentation in markdown format.

API Configuration:
```json
{{{apiConfig}}}
```

Ensure the documentation includes:
- Endpoint description
- Request parameters (if any)
- Response format
- Example usage

Output the documentation in markdown format.
`,
});

const generateApiDocumentationFlow = ai.defineFlow(
  {
    name: 'generateApiDocumentationFlow',
    inputSchema: GenerateApiDocumentationInputSchema,
    outputSchema: GenerateApiDocumentationOutputSchema,
  },
  async input => {
    const {output} = await generateApiDocumentationPrompt(input);
    return output!;
  }
);
