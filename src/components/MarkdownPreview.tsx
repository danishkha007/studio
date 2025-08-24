export function MarkdownPreview({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="rounded-md border bg-muted/50 p-4 h-full">
      <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-code text-sm text-foreground">
        {content}
      </pre>
    </div>
  );
}
