
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
import { Search, Film, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const TMDB_API_KEY = 'tmdb_api_key';
const LOCAL_MOVIE_DB_KEY = 'cinesync_movie_db';
const LOCAL_PEOPLE_DB_KEY = 'cinesync_people_db';

const getStoredMovieIds = (): number[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_MOVIE_DB_KEY);
    return stored ? JSON.parse(stored) : [];
};

const addMovieIdToStorage = (id: number) => {
    if (typeof window === 'undefined') return;
    const ids = getStoredMovieIds();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(LOCAL_MOVIE_DB_KEY, JSON.stringify(ids));
    }
};

const getStoredPeopleIds = (): number[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_PEOPLE_DB_KEY);
    return stored ? JSON.parse(stored) : [];
};

const addPersonIdToStorage = (id: number) => {
    if (typeof window === 'undefined') return;
    const ids = getStoredPeopleIds();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(LOCAL_PEOPLE_DB_KEY, JSON.stringify(ids));
    }
};


export default function MoviesPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [endpoint, setEndpoint] = React.useState('popular');
  const [count, setCount] = React.useState('20');
  const [singleId, setSingleId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<any | null>(null);

  React.useEffect(() => {
    const storedKey = localStorage.getItem(TMDB_API_KEY);
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
      title: 'Fetching Movies...',
      description: `Fetching from ${singleId ? `movie/${singleId}` : `movie/${endpoint}`} endpoint.`,
    });

    const baseUrl = 'https://api.themoviedb.org/3';
    let url = '';

    if (singleId) {
        url = `${baseUrl}/movie/${singleId}?api_key=${apiKey}&language=en-US`;
    } else {
        url = `${baseUrl}/movie/${endpoint}?api_key=${apiKey}&language=en-US&page=1`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status_message || 'Failed to fetch data');
      }
      
      let finalResults = data;
      let moviesToProcess: any[] = [];

      if (singleId) {
        finalResults = data;
        moviesToProcess.push(data);
      } else if (data.results) {
        const slicedResults = data.results.slice(0, parseInt(count));
        finalResults = { ...data, results: slicedResults };
        moviesToProcess.push(...slicedResults);
      }
      
      setResults(finalResults);
      
      toast({
        title: 'Fetch Successful',
        description: 'Data retrieved from TMDb. Now processing records.',
      });

      // Process movies and their related people
      setTimeout(async () => {
        const storedMovieIds = getStoredMovieIds();
        const storedPeopleIds = getStoredPeopleIds();

        for (const movie of moviesToProcess) {
            const movieExists = storedMovieIds.includes(movie.id);
            toast({
                title: movieExists ? 'Updating Existing Movie' : 'Ingesting New Movie',
                description: `Processing movie: ${movie.title} (ID: ${movie.id})`,
            });
            addMovieIdToStorage(movie.id);

            // Fetch credits for the movie
            const creditsUrl = `${baseUrl}/movie/${movie.id}/credits?api_key=${apiKey}`;
            try {
                const creditsResponse = await fetch(creditsUrl);
                const creditsData = await creditsResponse.json();
                if (!creditsResponse.ok) {
                    toast({
                        variant: 'destructive',
                        title: 'Error Fetching Credits',
                        description: `Could not fetch credits for movie ID ${movie.id}.`,
                    });
                    continue; // Move to the next movie
                }

                const peopleToProcess = [...creditsData.cast, ...creditsData.crew];

                for (const person of peopleToProcess) {
                    const personExists = storedPeopleIds.includes(person.id);
                    toast({
                        title: personExists ? 'Updating Existing Person' : 'Ingesting New Person',
                        description: `Processing person: ${person.name} (ID: ${person.id}) for movie "${movie.title}"`,
                    });
                    addPersonIdToStorage(person.id);
                }
            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Error Processing Credits',
                    description: error.message,
                });
            }
        }
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
          <h1 className="font-headline text-3xl font-bold">Movies</h1>
          <p className="text-muted-foreground">
            Fetch and manage your movie collection from TMDb.
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
                <SelectItem value="now_playing">Now Playing</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="count">Number of Records</Label>
            <Input id="count" type="number" placeholder="e.g., 50" value={count} onChange={e => setCount(e.target.value)} disabled={!!singleId || isLoading}/>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="single-id">Fetch by ID</Label>
            <Input id="single-id" placeholder="Enter movie ID" value={singleId} onChange={e => setSingleId(e.target.value)} disabled={isLoading}/>
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
                placeholder="Search for a movie in your local database..."
                className="w-full rounded-lg bg-card pl-8"
                />
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                <Film className="h-12 w-12" />
                <h3 className="text-2xl font-bold tracking-tight">
                    No movies found
                </h3>
                <p className="text-sm">
                    Try fetching movies from TMDb or refining your search.
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
