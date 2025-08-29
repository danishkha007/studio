
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import { Search, Film, Download, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const TMDB_API_KEY = 'tmdb_api_key';
const LOCAL_MOVIE_DB_KEY = 'cinesync_movie_db';
const LOCAL_PEOPLE_DB_KEY = 'cinesync_people_db';

const updateLocalStorageCount = (key: string, newIds: number[]) => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(key);
    const existingIds = stored ? JSON.parse(stored) : [];
    const updatedIds = Array.from(new Set([...existingIds, ...newIds]));
    localStorage.setItem(key, JSON.stringify(updatedIds));
};

export default function MoviesPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState('');
  const [endpoint, setEndpoint] = React.useState('popular');
  const [count, setCount] = React.useState('20');
  const [singleId, setSingleId] = React.useState('');
  const [isFetching, setIsFetching] = React.useState(false);

  const [movies, setMovies] = React.useState<any[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isMounted, setIsMounted] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);


  const fetchMovies = async (pageNum: number) => {
    if(pageNum === 1) {
        setIsLoadingMovies(true);
    } else {
        setIsLoadingMore(true);
    }
    try {
        const response = await fetch(`/api/movies?page=${pageNum}`);
        const data = await response.json();
        if(response.ok) {
            setMovies(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
            setHasMore(data.data.length > 0);
        } else {
            throw new Error(data.error || "Failed to fetch movies from DB");
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Could not load movies',
            description: error.message,
        });
    } finally {
        if(pageNum === 1) {
            setIsLoadingMovies(false);
        } else {
            setIsLoadingMore(false);
        }
    }
  };

  React.useEffect(() => {
    setIsMounted(true);
    const storedKey = localStorage.getItem(TMDB_API_KEY);
    if(storedKey) {
        setApiKey(storedKey);
    }
    fetchMovies(1);
  }, [toast]);
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage);
  }

  const handleFetch = async () => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Not Found',
        description: 'Please set your TMDb API key in the settings page.',
      });
      return;
    }

    setIsFetching(true);
    toast({
      title: 'Fetching Movies...',
      description: `Fetching from ${singleId ? `movie/${singleId}` : `movie/${endpoint}`} endpoint.`,
    });

    const baseUrl = 'https://api.themoviedb.org/3';
    const appendToResponse = 'credits,videos,images,keywords';
    let url = '';

    if (singleId) {
        url = `${baseUrl}/movie/${singleId}?api_key=${apiKey}&language=en-US&append_to_response=${appendToResponse}`;
    } else {
        url = `${baseUrl}/movie/${endpoint}?api_key=${apiKey}&language=en-US&page=1`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status_message || 'Failed to fetch data');
      }
      
      let moviesToProcess: any[] = [];

      if (singleId) {
        moviesToProcess.push(data);
      } else if (data.results) {
        const moviesWithDetails = await Promise.all(
          data.results.slice(0, parseInt(count)).map(async (movie: any) => {
            const detailUrl = `${baseUrl}/movie/${movie.id}?api_key=${apiKey}&append_to_response=${appendToResponse}`;
            const detailResponse = await fetch(detailUrl);
            return detailResponse.json();
          })
        );
        moviesToProcess.push(...moviesWithDetails);
      }
      
      toast({
        title: 'Fetch Successful',
        description: `${moviesToProcess.length} movies retrieved. Now ingesting into database.`,
      });

      const ingestResponse = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'movies', data: moviesToProcess }),
      });

      const ingestResult = await ingestResponse.json();

      if (!ingestResponse.ok) {
        throw new Error(ingestResult.error || 'Failed to ingest data');
      }

      toast({
          title: 'Ingestion Complete',
          description: ingestResult.message,
      });
      
      const movieIds = moviesToProcess.map(m => m.id);
      const peopleIds = moviesToProcess.flatMap(m => [...(m.credits?.cast ?? []), ...(m.credits?.crew ?? [])]).map(p => p.id);
      updateLocalStorageCount(LOCAL_MOVIE_DB_KEY, movieIds);
      updateLocalStorageCount(LOCAL_PEOPLE_DB_KEY, Array.from(new Set(peopleIds)));
      
      // Refresh the movie list from our DB
      setPage(1);
      fetchMovies(1);


    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message,
      });
    } finally {
      setIsFetching(false);
    }
  };
  
  if (!isMounted) {
    return null;
  }

  const filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
            Fetch From TMDb
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="endpoint">Endpoint</Label>
            <Select value={endpoint} onValueChange={setEndpoint} disabled={!!singleId || isFetching}>
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
            <Input id="count" type="number" placeholder="e.g., 50" value={count} onChange={e => setCount(e.target.value)} disabled={!!singleId || isFetching}/>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="single-id">Fetch by ID</Label>
            <Input id="single-id" placeholder="Enter movie ID" value={singleId} onChange={e => setSingleId(e.target.value)} disabled={isFetching}/>
          </div>
          <div className="flex items-end">
            <Button onClick={handleFetch} className="w-full" disabled={isFetching || !apiKey}>
              {isFetching ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
              Fetch & Ingest
            </Button>
          </div>
        </CardContent>
      </Card>
      
        <div>
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for a movie in your local database..."
                    className="w-full rounded-lg bg-card pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {isLoadingMovies ? (
                 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-0">
                                <Skeleton className="h-auto w-full aspect-[2/3]" />
                            </CardContent>
                            <CardHeader className="p-3">
                               <Skeleton className="h-4 w-4/5 mb-1" />
                               <Skeleton className="h-3 w-1/2" />
                            </CardHeader>
                        </Card>
                    ))}
                 </div>
            ) : filteredMovies.length > 0 ? (
                <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                    {filteredMovies.map(movie => (
                        <Card key={movie.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <Link href="#">
                                    <Image
                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`: 'https://placehold.co/500x750.png'}
                                        alt={movie.title}
                                        width={500}
                                        height={750}
                                        className="h-auto w-full object-cover transition-transform hover:scale-105"
                                        data-ai-hint="movie poster"
                                    />
                                </Link>
                            </CardContent>
                            <CardHeader className="p-3">
                                <CardTitle className="font-headline text-sm line-clamp-1">{movie.title}</CardTitle>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{new Date(movie.release_date).getFullYear()}</span>
                                     <Badge variant="outline" className="flex items-center gap-1 p-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400"/>
                                        {movie.vote_average}
                                    </Badge>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
                {hasMore && (
                    <div className="mt-6 flex justify-center">
                        <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                             {isLoadingMore ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Load More
                        </Button>
                    </div>
                )}
                </>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
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
            )}
        </div>
    </div>
  );
}

    