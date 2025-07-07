import ShortsPlayer from '@/app/(dashboard)/shorts/[id]/short'
import { ShortsSkeleton } from '@/components/shorts-skeleton'
import { Suspense } from 'react'

export default async function ShortPage() {
  return (
      <Suspense fallback={<ShortsSkeleton />}>
        <ShortsPlayer />
      </Suspense>
  )
}
