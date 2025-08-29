
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Film, Tv, Users, FileCode2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_MOVIE_DB_KEY = 'cinesync_movie_db';
const LOCAL_TV_DB_KEY = 'cinesync_tv_db';
const LOCAL_PEOPLE_DB_KEY = 'cinesync_people_db';

const getCountFromStorage = (key: string): number => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).length : 0;
};

export default function DashboardPage() {
    const [movieCount, setMovieCount] = React.useState(0);
    const [tvShowCount, setTvShowCount] = React.useState(0);
    const [peopleCount, setPeopleCount] = React.useState(0);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        setMovieCount(getCountFromStorage(LOCAL_MOVIE_DB_KEY));
        setTvShowCount(getCountFromStorage(LOCAL_TV_DB_KEY));
        setPeopleCount(getCountFromStorage(LOCAL_PEOPLE_DB_KEY));
    }, []);

    const DataCard = ({ title, icon: Icon, value, loading }: { title: string; icon: React.ElementType; value: number, loading: boolean }) => (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-24" /> : <div className="text-2xl font-bold">{value.toLocaleString() ?? 0}</div>}
            <p className="text-xs text-muted-foreground">
              Total records in local db
            </p>
          </CardContent>
        </Card>
    )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your CineSync data and activities.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard title="Total Movies" icon={Film} value={movieCount} loading={!isMounted} />
        <DataCard title="Total TV Shows" icon={Tv} value={tvShowCount} loading={!isMounted} />
        <DataCard title="People Records" icon={Users} value={peopleCount} loading={!isMounted} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
            <FileCode2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Statically defined</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    