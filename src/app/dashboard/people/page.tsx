
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'tmdb_api_key';

export default function PeoplePage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    setApiKey(storedKey);
  }, []);

  const handleFetch = () => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Not Found',
        description: 'Please set your TMDb API key in the settings page.',
      });
      return;
    }
    toast({
      title: 'Fetching People...',
      description: 'Simulating fetching people from TMDb.',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">People</h1>
          <p className="text-muted-foreground">
            Search and manage records of actors, directors, and more.
          </p>
        </div>
        <Button onClick={handleFetch}>
          <Search className="mr-2" />
          Fetch from TMDb
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a person..."
          className="w-full rounded-lg bg-card pl-8"
        />
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Users className="h-12 w-12" />
            <h3 className="text-2xl font-bold tracking-tight">No people found</h3>
            <p className="text-sm">
                Try fetching people from TMDb or refining your search.
            </p>
        </div>
      </div>
    </div>
  );
}
