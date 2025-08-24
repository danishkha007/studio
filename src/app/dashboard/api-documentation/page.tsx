import { ApiDocumentationGenerator } from './components/ApiDocumentationGenerator';

export default function ApiDocumentationPage() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          API Documentation Generator
        </h1>
        <p className="text-muted-foreground">
          Use AI to automatically generate documentation from an API configuration.
        </p>
      </div>
      <ApiDocumentationGenerator />
    </div>
  );
}
