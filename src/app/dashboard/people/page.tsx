
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LOCAL_STORAGE_KEY = 'tmdb_api_key';

export default function PeoplePage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [endpoint, setEndpoint] = React.useState('popular');
  const [count, setCount] = React.useState('20');
  const [singleId, setSingleId] = React.useState('');

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
      description: `Fetching from ${endpoint} endpoint.`,
    });
     setTimeout(() => {
        toast({
            title: 'Ingesting Data',
            description: 'Simulating ingestion into MySQL database.'
        })
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">People</h1>
          <p className="text-muted-foreground">
            Fetch and manage records of actors, directors, and more.
          </p>
        </div>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            Fetch Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Select value={endpoint} onValueChange={setEndpoint}>
              <SelectTrigger id="endpoint">
                <SelectValue placeholder="Select endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="count">Number of Records</Label>
            <Input id="count" type="number" placeholder="e.g., 50" value={count} onChange={e => setCount(e.target.value)} disabled={!!singleId}/>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="single-id">Fetch by ID</Label>
            <Input id="single-id" placeholder="Enter person ID" value={singleId} onChange={e => setSingleId(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFetch} className="w-full">
              <Download className="mr-2" />
              Fetch & Ingest
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a person in your local database..."
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
