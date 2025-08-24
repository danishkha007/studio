'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateDocsAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  documentation: '',
  error: null,
};

const exampleApiConfig = `{
  "path": "/users/{id}",
  "method": "GET",
  "description": "Retrieves a specific user by their ID.",
  "parameters": [
    {
      "name": "id",
      "in": "path",
      "description": "The unique identifier of the user.",
      "required": true,
      "schema": { "type": "integer" }
    }
  ],
  "responses": {
    "200": {
      "description": "Successful response with user data.",
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "name": { "type": "string" },
              "email": { "type": "string", "format": "email" }
            }
          }
        }
      }
    },
    "404": {
      "description": "User not found."
    }
  }
}`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Documentation
    </Button>
  );
}

export function ApiDocumentationGenerator() {
  const [state, formAction] = useFormState(generateDocsAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error?._server) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error._server[0],
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col gap-4">
          <Label htmlFor="apiConfig" className="font-headline text-lg">
            API Configuration (JSON)
          </Label>
          <Textarea
            id="apiConfig"
            name="apiConfig"
            placeholder="Paste your API's JSON configuration here."
            className="flex-1 font-code text-xs"
            defaultValue={exampleApiConfig}
          />
          {state?.error?.apiConfig && (
            <p className="text-sm text-destructive">{state.error.apiConfig[0]}</p>
          )}
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardContent className="p-6 flex-1">
            <Label htmlFor="documentation" className="font-headline text-lg block mb-4">
                Generated Documentation
            </Label>
            <ScrollArea className="h-[calc(100%-2.5rem)] w-full">
                {state.documentation ? (
                    <MarkdownPreview content={state.documentation} />
                ) : (
                    <div className="h-full flex items-center justify-center rounded-md border border-dashed">
                        <div className="text-center text-muted-foreground">
                            <Wand2 className="mx-auto h-12 w-12" />
                            <p className="mt-4">Your AI-generated documentation will appear here.</p>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </CardContent>
      </Card>
    </form>
  );
}
