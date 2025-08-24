'use server';

import { generateApiDocumentation } from '@/ai/flows/generate-api-documentation';
import { z } from 'zod';

const ApiDocSchema = z.object({
  apiConfig: z.string().min(10, { message: 'API configuration must not be empty.' }),
});

export async function generateDocsAction(prevState: any, formData: FormData) {
  const validatedFields = ApiDocSchema.safeParse({
    apiConfig: formData.get('apiConfig'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateApiDocumentation(validatedFields.data);
    return {
      documentation: result.documentation,
    };
  } catch (error) {
    return {
      error: { _server: ['An unexpected error occurred. Please try again.'] },
    };
  }
}
