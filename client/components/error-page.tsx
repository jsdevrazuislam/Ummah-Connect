import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ErrorPage({
  statusCode,
  title,
  message,
  actionText,
  actionHref,
}: {
  statusCode: number;
  title: string;
  message: string;
  actionText: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[90vh] gap-4 text-center p-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{statusCode}</h1>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
      <Button asChild>
        <Link href={actionHref}>{actionText}</Link>
      </Button>
    </div>
  );
}