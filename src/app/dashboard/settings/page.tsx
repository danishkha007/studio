
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

const TMDB_API_KEY = 'tmdb_api_key';
const MYSQL_CONFIG_KEY = 'mysql_config';

type MySQLConfig = {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState('');
  const [savedApiKey, setSavedApiKey] = React.useState('');
  const [mysqlConfig, setMysqlConfig] = React.useState<MySQLConfig>({});
  const [savedMysqlConfig, setSavedMysqlConfig] = React.useState<MySQLConfig | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const storedKey = localStorage.getItem(TMDB_API_KEY);
    if (storedKey) {
      setSavedApiKey(storedKey);
    }
    const storedMysqlConfig = localStorage.getItem(MYSQL_CONFIG_KEY);
    if (storedMysqlConfig) {
      setSavedMysqlConfig(JSON.parse(storedMysqlConfig));
    }
  }, []);

  const handleTmdbSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    localStorage.setItem(TMDB_API_KEY, apiKey);

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

  const handleMysqlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    localStorage.setItem(MYSQL_CONFIG_KEY, JSON.stringify(mysqlConfig));

    setTimeout(() => {
        setSavedMysqlConfig(mysqlConfig)
        setMysqlConfig({})
        setIsLoading(false)
        toast({
            title: "Database Settings Saved",
            description: "Your MySQL connection details have been saved."
        });
    }, 1000);
  }
  
  const handleMysqlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMysqlConfig(prev => ({...prev, [id]: value}));
  }

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
        <form onSubmit={handleTmdbSubmit}>
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
              Save API Key
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <form onSubmit={handleMysqlSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              MySQL Database Configuration
            </CardTitle>
            <CardDescription>
              Enter your MySQL connection details. These will be stored in your browser's local storage.
              This is for simulation purposes only and not a real database connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="host">Host</Label>
                <Input id="host" placeholder="e.g., localhost" value={mysqlConfig.host ?? ''} onChange={handleMysqlChange} disabled={isLoading}/>
                {savedMysqlConfig?.host && <p className="text-xs text-muted-foreground">Saved: {savedMysqlConfig.host}</p>}
              </div>
               <div className="flex flex-col space-y-1.5">
                <Label htmlFor="port">Port</Label>
                <Input id="port" placeholder="e.g., 3306" value={mysqlConfig.port ?? ''} onChange={handleMysqlChange} disabled={isLoading}/>
                {savedMysqlConfig?.port && <p className="text-xs text-muted-foreground">Saved: {savedMysqlConfig.port}</p>}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="user">User</Label>
                <Input id="user" placeholder="e.g., root" value={mysqlConfig.user ?? ''} onChange={handleMysqlChange} disabled={isLoading}/>
                 {savedMysqlConfig?.user && <p className="text-xs text-muted-foreground">Saved: {savedMysqlConfig.user}</p>}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={mysqlConfig.password ?? ''} onChange={handleMysqlChange} disabled={isLoading}/>
                 {savedMysqlConfig?.password && <p className="text-xs text-muted-foreground">Saved: ******</p>}
              </div>
              <div className="flex flex-col space-y-1.5 md:col-span-2">
                <Label htmlFor="database">Database</Label>
                <Input id="database" placeholder="e.g., tmdb_movies_db" value={mysqlConfig.database ?? ''} onChange={handleMysqlChange} disabled={isLoading}/>
                 {savedMysqlConfig?.database && <p className="text-xs text-muted-foreground">Saved: {savedMysqlConfig.database}</p>}
              </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading || !Object.values(mysqlConfig).some(v => v)}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save DB Settings
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
