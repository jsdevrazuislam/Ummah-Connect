import { Suspense } from "react";

import ShortsPlayer from "@/app/(dashboard)/shorts/[id]/short";
import { ShortsSkeleton } from "@/components/shorts-skeleton";

export default async function ShortPage() {
  return (
    <Suspense fallback={<ShortsSkeleton />}>
      <ShortsPlayer />
    </Suspense>
  );
}
