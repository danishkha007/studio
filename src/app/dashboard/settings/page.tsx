
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'tmdb_api_key';

export default function SettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState('');
  const [savedApiKey, setSavedApiKey] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedKey) {
      setSavedApiKey(storedKey);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);

    setTimeout(() => {
      setSavedApiKey(apiKey);
      setApiKey('');
      setIsLoading(false);
      toast({
        title: 'Settings Saved',
        description: 'Your TMDb API key has been saved successfully.',
      });
    }, 1000);
  };

  const lastFourDigits = savedApiKey ? `...${savedApiKey.slice(-4)}` : '';

  if (!isMounted) {
      return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations.
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              TMDb API Configuration
            </CardTitle>
            <CardDescription>
              Enter your The Movie Database (TMDb) API key here. Your key will be
              stored securely in your browser's local storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tmdb-api-key">API Key (v3 auth)</Label>
                <div className="flex items-center space-x-2">
                    <Input
                      id="tmdb-api-key"
                      placeholder="Enter your new TMDb API Key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={isLoading}
                      type="password"
                    />
                    {savedApiKey && (
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                            Saved: {lastFourDigits}
                        </div>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading || !apiKey}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
