
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
import { Search, Tv, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOCAL_STORAGE_KEY = 'tmdb_api_key';

export default function TvShowsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [endpoint, setEndpoint] = React.useState('popular');
  const [count, setCount] = React.useState('20');
  const [singleId, setSingleId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<any | null>(null);

  React.useEffect(() => {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    setApiKey(storedKey);
  }, []);

  const handleFetch = async () => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Not Found',
        description: 'Please set your TMDb API key in the settings page.',
      });
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    toast({
      title: 'Fetching TV Shows...',
      description: `Fetching from ${singleId ? `tv/${singleId}` : `tv/${endpoint}`} endpoint.`,
    });

    const baseUrl = 'https://api.themoviedb.org/3';
    let url = '';

    if (singleId) {
        url = `${baseUrl}/tv/${singleId}?api_key=${apiKey}&language=en-US`;
    } else {
        url = `${baseUrl}/tv/${endpoint}?api_key=${apiKey}&language=en-US&page=1`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status_message || 'Failed to fetch data');
      }

      let finalResults = data;
      if (!singleId && data.results) {
        finalResults = { ...data, results: data.results.slice(0, parseInt(count)) };
      }
      
      setResults(finalResults);

      toast({
        title: 'Fetch Successful',
        description: 'Data retrieved from TMDb.',
      });

      setTimeout(() => {
        toast({
            title: 'Ingesting Data',
            description: 'Simulating ingestion into MySQL database.'
        })
    }, 1500);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Data',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">TV Shows</h1>
          <p className="text-muted-foreground">
            Fetch and manage your TV show collection from TMDb.
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
            <Select value={endpoint} onValueChange={setEndpoint} disabled={!!singleId || isLoading}>
              <SelectTrigger id="endpoint">
                <SelectValue placeholder="Select endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="top_rated">Top Rated</SelectItem>
                <SelectItem value="on_the_air">On The Air</SelectItem>
                <SelectItem value="airing_today">Airing Today</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="count">Number of Records</Label>
            <Input id="count" type="number" placeholder="e.g., 50" value={count} onChange={e => setCount(e.target.value)} disabled={!!singleId || isLoading}/>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="single-id">Fetch by ID</Label>
            <Input id="single-id" placeholder="Enter TV show ID" value={singleId} onChange={e => setSingleId(e.target.value)} disabled={isLoading}/>
          </div>
          <div className="flex items-end">
            <Button onClick={handleFetch} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
              Fetch & Ingest
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
            <CardHeader>
                <CardTitle>Fetched Data</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 w-full">
                    <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

      {!results && !isLoading && (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for a TV show in your local database..."
              className="w-full rounded-lg bg-card pl-8"
            />
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                <Tv className="h-12 w-12" />
                <h3 className="text-2xl font-bold tracking-tight">No TV shows found</h3>
                <p className="text-sm">
                    Try fetching TV shows from TMDb or refining your search.
                </p>
            </div>
          </div>
        </>
      )}

      {isLoading && !results && (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin" />
            <h3 className="text-2xl font-bold tracking-tight">Fetching data...</h3>
            <p className="text-sm">Please wait while we fetch data from TMDb.</p>
          </div>
        </div>
      )}
    </div>
  );
}

    